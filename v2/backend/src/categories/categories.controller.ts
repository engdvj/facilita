import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '@prisma/client';
import { isCompanyMode, isUserMode } from '../common/app-mode';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req: any) {
    if (isUserMode()) {
      createCategoryDto.companyId = req.user?.id;
    }
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(
    @Query('companyId') companyId: string | undefined,
    @Query('includeInactive') includeInactive: string | undefined,
    @Request() req: any,
  ) {
    const isSuperAdmin = req.user?.role === UserRole.SUPERADMIN && isCompanyMode();
    const isAdmin = req.user?.role === UserRole.ADMIN;
    const resolvedCompanyId = isUserMode()
      ? req.user?.id
      : companyId?.trim() || undefined;
    if (!resolvedCompanyId && !isSuperAdmin) {
      throw new ForbiddenException('Empresa obrigatoria.');
    }
    const canViewInactive =
      includeInactive === 'true' && (isAdmin || isSuperAdmin);
    return this.categoriesService.findAll(resolvedCompanyId, canViewInactive);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
