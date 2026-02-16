import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
export declare class UploadedSchedulesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private include;
    private withShareMetadata;
    private normalizeVisibility;
    private ensurePublicToken;
    private assertCategoryOwner;
    private assertCanMutate;
    create(actor: {
        id: string;
        role: UserRole;
    }, dto: CreateScheduleDto): Promise<{
        category: {
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
            ownerId: string;
        } | null;
        _count: {
            favorites: number;
        };
        owner: {
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            email: string;
        };
        shares: {
            id: string;
            recipient: {
                name: string;
                id: string;
                email: string;
            };
        }[];
    } & {
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        ownerId: string;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        deletedAt: Date | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    } & {
        createdBy: any;
        shareCount: number;
        sharedWithPreview: any[];
    }>;
    findAll(viewer?: {
        id: string;
        role: UserRole;
    }, filters?: {
        categoryId?: string;
        search?: string;
    }): Promise<({
        category: {
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
            ownerId: string;
        } | null;
        _count: {
            favorites: number;
        };
        owner: {
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            email: string;
        };
        shares: {
            id: string;
            recipient: {
                name: string;
                id: string;
                email: string;
            };
        }[];
    } & {
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        ownerId: string;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        deletedAt: Date | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    } & {
        createdBy: any;
        shareCount: number;
        sharedWithPreview: any[];
    })[]>;
    findAllPaginated(filters: {
        categoryId?: string;
        search?: string;
        includeInactive?: boolean;
    }, pagination?: {
        skip?: number;
        take?: number;
    }): Promise<{
        items: ({
            category: {
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                color: string | null;
                icon: string | null;
                adminOnly: boolean;
                ownerId: string;
            } | null;
            _count: {
                favorites: number;
            };
            owner: {
                name: string;
                role: import(".prisma/client").$Enums.UserRole;
                id: string;
                email: string;
            };
            shares: {
                id: string;
                recipient: {
                    name: string;
                    id: string;
                    email: string;
                };
            }[];
        } & {
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            ownerId: string;
            title: string;
            imageUrl: string | null;
            imagePosition: string | null;
            imageScale: number | null;
            visibility: import(".prisma/client").$Enums.ContentVisibility;
            publicToken: string | null;
            deletedAt: Date | null;
            categoryId: string | null;
            fileUrl: string;
            fileName: string;
            fileSize: number;
        } & {
            createdBy: any;
            shareCount: number;
            sharedWithPreview: any[];
        })[];
        total: number;
    }>;
    findOne(id: string, viewer?: {
        id?: string;
        role?: UserRole;
    }): Promise<{
        category: {
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
            ownerId: string;
        } | null;
        _count: {
            favorites: number;
        };
        owner: {
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            email: string;
        };
        shares: {
            id: string;
            recipient: {
                name: string;
                id: string;
                email: string;
            };
        }[];
    } & {
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        ownerId: string;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        deletedAt: Date | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    } & {
        createdBy: any;
        shareCount: number;
        sharedWithPreview: any[];
    }>;
    findPublicByToken(publicToken: string): Promise<{
        category: {
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
            ownerId: string;
        } | null;
        owner: {
            name: string;
            id: string;
            email: string;
        };
    } & {
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        ownerId: string;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        deletedAt: Date | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    update(id: string, actor: {
        id: string;
        role: UserRole;
    }, dto: UpdateScheduleDto): Promise<{
        category: {
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
            ownerId: string;
        } | null;
        _count: {
            favorites: number;
        };
        owner: {
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            email: string;
        };
        shares: {
            id: string;
            recipient: {
                name: string;
                id: string;
                email: string;
            };
        }[];
    } & {
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        ownerId: string;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        deletedAt: Date | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    } & {
        createdBy: any;
        shareCount: number;
        sharedWithPreview: any[];
    }>;
    remove(id: string, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        category: {
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
            ownerId: string;
        } | null;
        _count: {
            favorites: number;
        };
        owner: {
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            email: string;
        };
        shares: {
            id: string;
            recipient: {
                name: string;
                id: string;
                email: string;
            };
        }[];
    } & {
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        ownerId: string;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        deletedAt: Date | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    } & {
        createdBy: any;
        shareCount: number;
        sharedWithPreview: any[];
    }>;
    restore(id: string, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        category: {
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
            ownerId: string;
        } | null;
        _count: {
            favorites: number;
        };
        owner: {
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            email: string;
        };
        shares: {
            id: string;
            recipient: {
                name: string;
                id: string;
                email: string;
            };
        }[];
    } & {
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        ownerId: string;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        deletedAt: Date | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    } & {
        createdBy: any;
        shareCount: number;
        sharedWithPreview: any[];
    }>;
    activate(id: string, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        category: {
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
            ownerId: string;
        } | null;
        _count: {
            favorites: number;
        };
        owner: {
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            email: string;
        };
        shares: {
            id: string;
            recipient: {
                name: string;
                id: string;
                email: string;
            };
        }[];
    } & {
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        ownerId: string;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        deletedAt: Date | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    } & {
        createdBy: any;
        shareCount: number;
        sharedWithPreview: any[];
    }>;
    deactivate(id: string, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        category: {
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
            ownerId: string;
        } | null;
        _count: {
            favorites: number;
        };
        owner: {
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            email: string;
        };
        shares: {
            id: string;
            recipient: {
                name: string;
                id: string;
                email: string;
            };
        }[];
    } & {
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        ownerId: string;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        deletedAt: Date | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    } & {
        createdBy: any;
        shareCount: number;
        sharedWithPreview: any[];
    }>;
}
