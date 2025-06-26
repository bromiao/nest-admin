import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrmType } from '../../enum/orm.enum';
import { ConfigEnum } from '../../enum/config.enum';

/**
 * ORM工厂服务
 * 根据配置决定使用哪种ORM
 */
@Injectable()
export class OrmFactoryService {
  private readonly logger = new Logger(OrmFactoryService.name);
  private readonly ormType: OrmType;

  constructor(private configService: ConfigService) {
    this.ormType =
      this.configService.get<OrmType>(ConfigEnum.ORM_TYPE) || OrmType.TYPEORM;
    this.logger.log(`Using ORM: ${this.ormType}`);
  }

  /**
   * 获取当前使用的ORM类型
   */
  getOrmType(): OrmType {
    return this.ormType;
  }

  /**
   * 检查是否使用TypeORM
   */
  isTypeOrm(): boolean {
    return this.ormType === OrmType.TYPEORM;
  }

  /**
   * 检查是否使用Prisma
   */
  isPrisma(): boolean {
    return this.ormType === OrmType.PRISMA;
  }

  /**
   * 获取ORM配置信息
   */
  getOrmInfo() {
    return {
      type: this.ormType,
      isTypeOrm: this.isTypeOrm(),
      isPrisma: this.isPrisma(),
    };
  }
}
