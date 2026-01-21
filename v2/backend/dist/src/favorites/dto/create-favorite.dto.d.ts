import { EntityType } from '@prisma/client';
export declare class CreateFavoriteDto {
    entityType: EntityType;
    linkId?: string;
    scheduleId?: string;
    noteId?: string;
}
