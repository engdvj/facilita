import { ResetDto } from './dto/reset.dto';
import { ResetsService } from './resets.service';
export declare class ResetsController {
    private readonly resetsService;
    constructor(resetsService: ResetsService);
    reset(data: ResetDto): Promise<{
        deleted: Partial<Record<"units" | "sectors" | "users" | "categories" | "links" | "notes" | "tagOnLink" | "tagOnSchedule" | "companies" | "tags" | "rolePermissions" | "uploadedSchedules", number>>;
        entities: ("units" | "sectors" | "users" | "categories" | "links" | "notes" | "tagOnLink" | "tagOnSchedule" | "companies" | "tags" | "rolePermissions" | "uploadedSchedules")[];
        seeded: boolean;
    }>;
}
