import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { SystemConfigService } from './system-config.service';
export declare class SystemConfigController {
    private readonly systemConfigService;
    constructor(systemConfigService: SystemConfigService);
    findAll(): any;
    findOne(key: string): Promise<any>;
    update(key: string, data: UpdateSystemConfigDto): Promise<any>;
}
