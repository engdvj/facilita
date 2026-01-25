import { ResetDto } from './dto/reset.dto';
import { ResetsService } from './resets.service';
export declare class ResetsController {
    private readonly resetsService;
    constructor(resetsService: ResetsService);
    reset(data: ResetDto): Promise<{
        deleted: Partial<Record<"sectors" | "links" | "notes" | "uploadedImages" | "users" | "units" | "categories" | "companies" | "rolePermissions" | "uploadedSchedules", number>>;
        entities: ("sectors" | "links" | "notes" | "uploadedImages" | "users" | "units" | "categories" | "companies" | "rolePermissions" | "uploadedSchedules")[];
        seeded: boolean;
    }>;
}
