from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task, Category, Tag, SubTask

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'user']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'user']

class SubTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTask
        fields = ['id', 'title', 'completed', 'position', 'task']
        read_only_fields = ['task']

class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    tags_data = TagSerializer(source='tags', many=True, read_only=True)
    subtasks = SubTaskSerializer(many=True, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'completed', 'created_at', 'updated_at',
            'due_date', 'reminder_date', 'priority', 'status', 'category', 
            'category_name', 'category_color', 'tags', 'tags_data', 'user',
            'position', 'subtasks', 'is_overdue'
        ]
        read_only_fields = ['created_at', 'updated_at']

class TaskListSerializer(serializers.ModelSerializer):
    """A lightweight serializer for list views"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    subtasks_count = serializers.SerializerMethodField()
    completed_subtasks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'completed', 'due_date', 'priority', 'status',
            'category', 'category_name', 'category_color', 'position',
            'subtasks_count', 'completed_subtasks_count', 'is_overdue'
        ]
    
    def get_subtasks_count(self, obj):
        return obj.subtasks.count()
    
    def get_completed_subtasks_count(self, obj):
        return obj.subtasks.filter(completed=True).count()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user