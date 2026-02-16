import { Response } from 'express';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { LinksService } from './links.service';
export declare class LinksController {
    private readonly linksService;
    constructor(linksService: LinksService);
    create(createLinkDto: CreateLinkDto, req: any): Promise<{
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
        url: string;
        description: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        order: number;
        deletedAt: Date | null;
        categoryId: string | null;
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
        url: string;
        description: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        order: number;
        deletedAt: Date | null;
        categoryId: string | null;
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
        url: string;
        description: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        order: number;
        deletedAt: Date | null;
        categoryId: string | null;
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
        url: string;
        description: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        order: number;
        deletedAt: Date | null;
        categoryId: string | null;
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
        url: string;
        description: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        order: number;
        deletedAt: Date | null;
        categoryId: string | null;
    } & {
        createdBy: any;
        shareCount: number;
        sharedWithPreview: any[];
    }>;
    update(id: string, updateLinkDto: UpdateLinkDto, req: any): Promise<{
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
        url: string;
        description: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        order: number;
        deletedAt: Date | null;
        categoryId: string | null;
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
        url: string;
        description: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        order: number;
        deletedAt: Date | null;
        categoryId: string | null;
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
        url: string;
        description: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        order: number;
        deletedAt: Date | null;
        categoryId: string | null;
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
        url: string;
        description: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        order: number;
        deletedAt: Date | null;
        categoryId: string | null;
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
        url: string;
        description: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        visibility: import(".prisma/client").$Enums.ContentVisibility;
        publicToken: string | null;
        order: number;
        deletedAt: Date | null;
        categoryId: string | null;
    } & {
        createdBy: any;
        shareCount: number;
        sharedWithPreview: any[];
    }>;
}
