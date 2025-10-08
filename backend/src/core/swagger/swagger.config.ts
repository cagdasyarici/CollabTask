// Swagger/OpenAPI konfigürasyonu
import swaggerJSDoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CollabTask API v2.0',
            version: '2.0.0',
            description: 'Modern proje yönetimi platformu - CQRS ve Domain-Driven Design mimarisine dayalı Node.js + TypeScript API',
            contact: {
                name: 'CollabTask Team',
                email: 'info@collabtask.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'https://api.collabtask.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                // =============================================================================
                // COMMON SCHEMAS
                // =============================================================================
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            description: 'İşlem başarı durumu'
                        },
                        data: {
                            description: 'Yanıt verisi'
                        },
                        message: {
                            type: 'string',
                            description: 'İşlem mesajı'
                        },
                        error: {
                            type: 'string',
                            description: 'Hata mesajı'
                        }
                    },
                    required: ['success']
                },
                PaginationResponse: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: {}
                        },
                        pagination: {
                            $ref: '#/components/schemas/Pagination'
                        }
                    }
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', minimum: 1 },
                        limit: { type: 'integer', minimum: 1, maximum: 100 },
                        total: { type: 'integer', minimum: 0 },
                        totalPages: { type: 'integer', minimum: 0 }
                    }
                },
                HealthCheck: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'OK' },
                        message: { type: 'string', example: 'CollabTask API çalışıyor' },
                        timestamp: { type: 'string', format: 'date-time' },
                        version: { type: 'string', example: '2.0.0' },
                        endpoints: { type: 'object' },
                        totalEndpoints: { type: 'integer', example: 82 },
                        implementedEndpoints: { type: 'integer', example: 82 },
                        coverage: { type: 'string', example: '100%' }
                    }
                },

                // =============================================================================
                // USER SCHEMAS
                // =============================================================================
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'Kullanıcı ID' },
                        name: { type: 'string', description: 'Kullanıcı tam adı' },
                        email: { type: 'string', format: 'email', description: 'Email adresi' },
                        avatar: { type: 'string', description: 'Profil resmi URL' },
                        role: { 
                            type: 'string', 
                            enum: ['admin', 'manager', 'member'],
                            description: 'Kullanıcı rolü'
                        },
                        status: { 
                            type: 'string', 
                            enum: ['active', 'inactive', 'invited'],
                            description: 'Kullanıcı durumu'
                        },
                        position: { type: 'string', description: 'Pozisyon/unvan' },
                        department: { type: 'string', description: 'Departman' },
                        timezone: { type: 'string', description: 'Zaman dilimi' },
                        preferences: { type: 'object', description: 'Kullanıcı tercihleri' },
                        createdAt: { type: 'string', format: 'date-time' },
                        lastActive: { type: 'string', format: 'date-time' }
                    }
                },
                CreateUserRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: { type: 'string', minLength: 2, description: 'Kullanıcı tam adı' },
                        email: { type: 'string', format: 'email', description: 'Email adresi' },
                        password: { type: 'string', minLength: 6, description: 'Şifre (min 6 karakter)' }
                    }
                },

                // =============================================================================
                // AUTHENTICATION SCHEMAS
                // =============================================================================
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        user: { $ref: '#/components/schemas/User' },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                        expiresIn: { type: 'integer', description: 'Saniye cinsinden geçerlilik süresi' }
                    }
                },

                // =============================================================================
                // PROJECT SCHEMAS
                // =============================================================================
                Project: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string', description: 'Proje adı' },
                        description: { type: 'string', description: 'Proje açıklaması' },
                        status: { 
                            type: 'string', 
                            enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
                            description: 'Proje durumu'
                        },
                        priority: { 
                            type: 'string', 
                            enum: ['low', 'medium', 'high', 'urgent'],
                            description: 'Öncelik seviyesi'
                        },
                        progress: { type: 'number', minimum: 0, maximum: 100, description: 'Tamamlanma yüzdesi' },
                        color: { type: 'string', description: 'Proje rengi (hex code)' },
                        icon: { type: 'string', description: 'Proje ikonu' },
                        visibility: { 
                            type: 'string', 
                            enum: ['public', 'team', 'private'],
                            description: 'Görünürlük seviyesi'
                        },
                        ownerId: { type: 'string', description: 'Proje sahibinin ID\'si' },
                        teamIds: { type: 'array', items: { type: 'string' }, description: 'Takım ID\'leri' },
                        memberIds: { type: 'array', items: { type: 'string' }, description: 'Üye ID\'leri' },
                        tags: { type: 'array', items: { type: 'string' }, description: 'Proje etiketleri' },
                        startDate: { type: 'string', format: 'date-time', description: 'Başlangıç tarihi' },
                        dueDate: { type: 'string', format: 'date-time', description: 'Bitiş tarihi' },
                        completedAt: { type: 'string', format: 'date-time', description: 'Tamamlanma tarihi' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                CreateProjectRequest: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        description: { type: 'string' },
                        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                        color: { type: 'string' },
                        icon: { type: 'string' },
                        visibility: { type: 'string', enum: ['public', 'team', 'private'] },
                        dueDate: { type: 'string', format: 'date-time' },
                        tags: { type: 'array', items: { type: 'string' } },
                        teamIds: { type: 'array', items: { type: 'string' } },
                        memberIds: { type: 'array', items: { type: 'string' } }
                    }
                },

                // =============================================================================
                // TASK SCHEMAS
                // =============================================================================
                Task: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string', description: 'Görev başlığı' },
                        description: { type: 'string', description: 'Görev açıklaması' },
                        status: { 
                            type: 'string', 
                            enum: ['backlog', 'todo', 'in_progress', 'review', 'done', 'blocked'],
                            description: 'Görev durumu'
                        },
                        priority: { 
                            type: 'string', 
                            enum: ['low', 'medium', 'high', 'urgent'],
                            description: 'Öncelik seviyesi'
                        },
                        projectId: { type: 'string', description: 'Bağlı olduğu proje ID' },
                        assigneeIds: { type: 'array', items: { type: 'string' }, description: 'Atanan kullanıcı ID\'leri' },
                        reporterId: { type: 'string', description: 'Görevi oluşturan kullanıcı ID' },
                        estimatedHours: { type: 'number', minimum: 0, description: 'Tahmini süre (saat)' },
                        actualHours: { type: 'number', minimum: 0, description: 'Gerçek harcanan süre (saat)' },
                        tags: { type: 'array', items: { type: 'string' }, description: 'Görev etiketleri' },
                        dependencies: { type: 'array', items: { type: 'string' }, description: 'Bağımlı görev ID\'leri' },
                        position: { type: 'number', description: 'Sıralama pozisyonu' },
                        startDate: { type: 'string', format: 'date-time', description: 'Başlangıç tarihi' },
                        dueDate: { type: 'string', format: 'date-time', description: 'Bitiş tarihi' },
                        completedAt: { type: 'string', format: 'date-time', description: 'Tamamlanma tarihi' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                CreateTaskRequest: {
                    type: 'object',
                    required: ['title', 'projectId'],
                    properties: {
                        title: { type: 'string', minLength: 1 },
                        description: { type: 'string' },
                        projectId: { type: 'string' },
                        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                        assigneeIds: { type: 'array', items: { type: 'string' } },
                        estimatedHours: { type: 'number', minimum: 0 },
                        tags: { type: 'array', items: { type: 'string' } },
                        dueDate: { type: 'string', format: 'date-time' },
                        startDate: { type: 'string', format: 'date-time' }
                    }
                },

                // =============================================================================
                // TEAM SCHEMAS
                // =============================================================================
                Team: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string', description: 'Takım adı' },
                        description: { type: 'string', description: 'Takım açıklaması' },
                        leaderId: { type: 'string', description: 'Takım lideri ID' },
                        memberIds: { type: 'array', items: { type: 'string' }, description: 'Takım üyesi ID\'leri' },
                        color: { type: 'string', description: 'Takım rengi' },
                        department: { type: 'string', description: 'Departman' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                CreateTeamRequest: {
                    type: 'object',
                    required: ['name', 'leaderId'],
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        description: { type: 'string' },
                        leaderId: { type: 'string' },
                        memberIds: { type: 'array', items: { type: 'string' } },
                        color: { type: 'string' },
                        department: { type: 'string' }
                    }
                },

                // =============================================================================
                // NOTIFICATION SCHEMAS
                // =============================================================================
                Notification: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        type: { 
                            type: 'string', 
                            enum: ['task_assigned', 'task_completed', 'comment_added', 'due_date_reminder', 'project_invitation', 'mention'],
                            description: 'Bildirim türü'
                        },
                        title: { type: 'string', description: 'Bildirim başlığı' },
                        message: { type: 'string', description: 'Bildirim mesajı' },
                        userId: { type: 'string', description: 'Hedef kullanıcı ID' },
                        read: { type: 'boolean', description: 'Okundu durumu' },
                        relatedId: { type: 'string', description: 'İlişkili kaynak ID' },
                        relatedType: { 
                            type: 'string', 
                            enum: ['task', 'project', 'comment', 'user'],
                            description: 'İlişkili kaynak türü'
                        },
                        actionUrl: { type: 'string', description: 'Eylem URL\'si' },
                        createdAt: { type: 'string', format: 'date-time' },
                        readAt: { type: 'string', format: 'date-time' }
                    }
                },

                // =============================================================================
                // ACTIVITY SCHEMAS
                // =============================================================================
                Activity: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        type: { 
                            type: 'string', 
                            enum: ['task_created', 'task_updated', 'task_completed', 'project_created', 'comment_added', 'member_added'],
                            description: 'Aktivite türü'
                        },
                        userId: { type: 'string', description: 'Aktiviteyi gerçekleştiren kullanıcı ID' },
                        projectId: { type: 'string', description: 'İlişkili proje ID' },
                        taskId: { type: 'string', description: 'İlişkili görev ID' },
                        description: { type: 'string', description: 'Aktivite açıklaması' },
                        metadata: { type: 'object', description: 'Ek bilgiler' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },

                // =============================================================================
                // FILE SCHEMAS
                // =============================================================================
                FileItem: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string', description: 'Dosya adı' },
                        originalName: { type: 'string', description: 'Orijinal dosya adı' },
                        type: { type: 'string', description: 'MIME tipi' },
                        size: { type: 'integer', description: 'Dosya boyutu (byte)' },
                        url: { type: 'string', description: 'Dosya URL\'si' },
                        uploadedBy: { type: 'string', description: 'Yükleyen kullanıcı ID' },
                        uploadedAt: { type: 'string', format: 'date-time' },
                        downloadCount: { type: 'integer', description: 'İndirilme sayısı' },
                        isPublic: { type: 'boolean', description: 'Herkese açık mı' },
                        metadata: { type: 'object', description: 'Dosya meta verileri' }
                    }
                },
                UploadFileRequest: {
                    type: 'object',
                    required: ['name', 'type', 'size'],
                    properties: {
                        name: { type: 'string' },
                        type: { type: 'string' },
                        size: { type: 'integer' },
                        content: { type: 'string', description: 'Base64 encoded content' }
                    }
                },

                // =============================================================================
                // SEARCH SCHEMAS
                // =============================================================================
                SearchResult: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        type: { 
                            type: 'string', 
                            enum: ['project', 'task', 'user', 'file'],
                            description: 'Sonuç türü'
                        },
                        title: { type: 'string', description: 'Başlık' },
                        description: { type: 'string', description: 'Açıklama' },
                        url: { type: 'string', description: 'Detay URL\'si' },
                        relevance: { type: 'number', description: 'İlgililik skoru' },
                        highlight: { type: 'string', description: 'Vurgulanan metin' },
                        metadata: { type: 'object', description: 'Ek bilgiler' }
                    }
                },

                // =============================================================================
                // ANALYTICS SCHEMAS
                // =============================================================================
                DashboardAnalytics: {
                    type: 'object',
                    properties: {
                        overview: { type: 'object', description: 'Genel istatistikler' },
                        recentActivity: { type: 'array', items: { type: 'object' } },
                        projectProgress: { type: 'array', items: { type: 'object' } },
                        tasksByStatus: { type: 'object' },
                        tasksByPriority: { type: 'object' },
                        productivity: { type: 'object' }
                    }
                },

                // =============================================================================
                // ADMIN SCHEMAS
                // =============================================================================
                SystemStats: {
                    type: 'object',
                    properties: {
                        overview: { type: 'object' },
                        performance: { type: 'object' },
                        security: { type: 'object' },
                        usage: { type: 'object' },
                        database: { type: 'object' }
                    }
                },
                AuditLog: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        timestamp: { type: 'string', format: 'date-time' },
                        action: { type: 'string', description: 'Gerçekleştirilen eylem' },
                        category: { type: 'string', description: 'Eylem kategorisi' },
                        severity: { 
                            type: 'string', 
                            enum: ['info', 'warning', 'error', 'critical'],
                            description: 'Önem seviyesi'
                        },
                        userId: { type: 'string', description: 'Kullanıcı ID' },
                        userName: { type: 'string', description: 'Kullanıcı adı' },
                        ipAddress: { type: 'string', description: 'IP adresi' },
                        userAgent: { type: 'string', description: 'Tarayıcı bilgisi' },
                        details: { type: 'object', description: 'Detay bilgileri' },
                        resource: { type: 'string', description: 'Etkilenen kaynak türü' },
                        resourceId: { type: 'string', description: 'Etkilenen kaynak ID' }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
        './src/app.ts',
        './src/features/auth/api/auth.routes.ts',
        './src/features/users/api/users.routes.ts',
        './src/features/projects/api/projects.routes.ts',
        './src/features/tasks/api/tasks.routes.ts',
        './src/features/teams/api/teams.routes.ts',
        './src/features/notifications/api/notifications.routes.ts',
        './src/features/activities/api/activities.routes.ts',
        './src/features/files/api/files.routes.ts',
        './src/features/search/api/search.routes.ts',
        './src/features/admin/api/admin.routes.ts'
    ]
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions); 