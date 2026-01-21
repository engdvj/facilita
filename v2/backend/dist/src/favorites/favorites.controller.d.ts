import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { EntityType } from '@prisma/client';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    create(req: any, createFavoriteDto: CreateFavoriteDto): Promise<any>;
    findMyFavorites(req: any, type?: EntityType): Promise<any>;
    countMyFavorites(req: any): Promise<{
        count: number;
    }>;
    checkFavorited(req: any, entityType: EntityType, entityId: string): Promise<{
        isFavorited: boolean;
    }>;
    countByEntity(entityType: EntityType, entityId: string): Promise<{
        count: number;
    }>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
    removeByEntity(req: any, entityType: EntityType, entityId: string): Promise<{
        message: string;
    }>;
}
