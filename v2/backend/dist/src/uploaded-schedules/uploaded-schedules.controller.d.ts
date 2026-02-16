import { Response } from 'express';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { UploadedSchedulesService } from './uploaded-schedules.service';
export declare class UploadedSchedulesController {
    private readonly schedulesService;
    constructor(schedulesService: UploadedSchedulesService);
    create(dto: CreateScheduleDto, req: any): Promise<{
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
    findAll(req?: any, categoryId?: string, search?: string): Promise<({
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
    findAllAdmin(req: any, categoryId?: string, search?: string, includeInactive?: string, page?: string, pageSize?: string, res?: Response): Promise<({
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
    findAllAdminAlias(req: any, categoryId?: string, search?: string, includeInactive?: string, page?: string, pageSize?: string, res?: Response): Promise<({
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
    findOne(id: string, req?: any): Promise<{
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
    update(id: string, dto: UpdateScheduleDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
    restore(id: string, req: any): Promise<{
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
    activate(id: string, req: any): Promise<{
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
    deactivate(id: string, req: any): Promise<{
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
