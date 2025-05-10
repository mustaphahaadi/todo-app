from rest_framework import status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Count, Q
from django.contrib.auth.models import User
from .models import Task, Category, Tag, SubTask
from .serializers import (
    TaskSerializer, TaskListSerializer, CategorySerializer, 
    TagSerializer, SubTaskSerializer, UserSerializer, UserRegistrationSerializer
)

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.user == request.user

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own profile
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return Category.objects.filter(
            Q(user=self.request.user) | Q(user__isnull=True)
        )
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return Tag.objects.filter(
            Q(user=self.request.user) | Q(user__isnull=True)
        )
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TaskListSerializer
        return TaskSerializer
    
    def get_queryset(self):
        queryset = Task.objects.filter(user=self.request.user)
        
        # Filter by query parameters
        category = self.request.query_params.get('category')
        priority = self.request.query_params.get('priority')
        status_param = self.request.query_params.get('status')
        completed = self.request.query_params.get('completed')
        due_date = self.request.query_params.get('due_date')
        overdue = self.request.query_params.get('overdue')
        tag = self.request.query_params.get('tag')
        search = self.request.query_params.get('search')
        
        if category:
            queryset = queryset.filter(category__id=category)
        if priority:
            queryset = queryset.filter(priority=priority)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if completed is not None:
            queryset = queryset.filter(completed=completed.lower() == 'true')
        if due_date:
            queryset = queryset.filter(due_date__date=due_date)
        if overdue and overdue.lower() == 'true':
            queryset = queryset.filter(due_date__lt=timezone.now(), completed=False)
        if tag:
            queryset = queryset.filter(tags__id=tag)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
            
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_tag(self, request, pk=None):
        task = self.get_object()
        tag_id = request.data.get('tag_id')
        
        try:
            tag = Tag.objects.get(id=tag_id)
            task.tags.add(tag)
            return Response({'status': 'tag added'})
        except Tag.DoesNotExist:
            return Response(
                {'error': 'Tag not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def remove_tag(self, request, pk=None):
        task = self.get_object()
        tag_id = request.data.get('tag_id')
        
        try:
            tag = Tag.objects.get(id=tag_id)
            task.tags.remove(tag)
            return Response({'status': 'tag removed'})
        except Tag.DoesNotExist:
            return Response(
                {'error': 'Tag not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def update_position(self, request, pk=None):
        task = self.get_object()
        position = request.data.get('position')
        
        if position is not None:
            task.position = position
            task.save()
            return Response({'status': 'position updated'})
        return Response(
            {'error': 'Position not provided'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        user_tasks = Task.objects.filter(user=request.user)
        
        stats = {
            'total': user_tasks.count(),
            'completed': user_tasks.filter(completed=True).count(),
            'active': user_tasks.filter(completed=False).count(),
            'overdue': user_tasks.filter(due_date__lt=timezone.now(), completed=False).count(),
            'by_priority': {
                'high': user_tasks.filter(priority='high').count(),
                'medium': user_tasks.filter(priority='medium').count(),
                'low': user_tasks.filter(priority='low').count(),
            },
            'by_status': {
                'todo': user_tasks.filter(status='todo').count(),
                'in_progress': user_tasks.filter(status='in_progress').count(),
                'done': user_tasks.filter(status='done').count(),
            }
        }
        
        return Response(stats)

class SubTaskViewSet(viewsets.ModelViewSet):
    serializer_class = SubTaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SubTask.objects.filter(task__user=self.request.user)
    
    def perform_create(self, serializer):
        task_id = self.request.data.get('task')
        try:
            task = Task.objects.get(id=task_id, user=self.request.user)
            serializer.save(task=task)
        except Task.DoesNotExist:
            raise serializers.ValidationError("Task not found or you don't have permission")