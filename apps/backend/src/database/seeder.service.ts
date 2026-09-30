import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { ROLES_SEED, USERS_SEED } from './seeds/roles.seed';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    const alreadySeeded = await this.dataSource.getRepository(Role).count({ withDeleted: true }) > 0;
    if (alreadySeeded) {
      this.logger.log('Base de datos ya inicializada — seed omitido');
      return;
    }

    this.logger.log('Iniciando seed inicial (roles y usuarios)...');
    await this.dataSource.transaction((manager) => this.seedRolesAndUsers(manager));
    this.logger.log('Seed completado exitosamente');
  }

  private async seedRolesAndUsers(manager: EntityManager) {
    const roles = await manager.save(Role, ROLES_SEED);
    const roleMap = new Map(roles.map((r) => [r.name, r]));

    const users = await Promise.all(
      USERS_SEED.map(async ({ name, email, password, roleName }) => ({
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: roleMap.get(roleName),
      })),
    );
    await manager.save(User, users);

    this.logger.log(`  ✔ Roles: ${roles.map((r) => r.name).join(', ')}`);
    this.logger.log(`  ✔ Usuarios: ${USERS_SEED.map((u) => u.email).join(', ')}`);
  }
}
