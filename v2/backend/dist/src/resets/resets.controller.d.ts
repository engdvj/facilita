import { ResetDto } from './dto/reset.dto';
import { ResetsService } from './resets.service';
export declare class ResetsController {
    private readonly resetsService;
    constructor(resetsService: ResetsService);
    reset(data: ResetDto): Promise<{
        deleted: Partial<Record<"systemConfig" | "categories" | "favorites" | "uploadedImages" | "notifications" | "links" | "notes" | "shares" | "users" | "rolePermissions" | "uploadedSchedules", number>>;
        entities: ("systemConfig" | "categories" | "favorites" | "uploadedImages" | "notifications" | "links" | "notes" | "shares" | "users" | "rolePermissions" | "uploadedSchedules")[];
        seeded: boolean;
    }>;
}
