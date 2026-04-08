import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { CreateAuditLogDto, QueryAuditLogsDto } from './dto';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(createAuditLogDto);
    return await this.auditLogRepository.save(auditLog);
  }

  async log(
    userId: number,
    tableName: string,
    recordId: number,
    action: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
  ): Promise<AuditLog> {
    return this.create({
      userId,
      tableName,
      recordId,
      action,
      oldValues,
      newValues,
      ipAddress,
    });
  }

  async findAll(query: QueryAuditLogsDto) {
    const {
      userId,
      tableName,
      action,
      recordId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.createdAt', 'DESC');

    if (userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId });
    }

    if (tableName) {
      queryBuilder.andWhere('audit.tableName = :tableName', { tableName });
    }

    if (action) {
      queryBuilder.andWhere('audit.action = :action', { action });
    }

    if (recordId) {
      queryBuilder.andWhere('audit.recordId = :recordId', { recordId });
    }

    if (startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('audit.createdAt <= :endDate', {
        endDate: endDateTime,
      });
    }

    const [logs, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        userName: log.user
          ? `${log.user.firstName} ${log.user.lastName}`
          : 'Unknown',
        userEmail: log.user?.email || 'N/A',
        tableName: log.tableName,
        recordId: log.recordId,
        action: log.action,
        oldValues: log.oldValues,
        newValues: log.newValues,
        changes: this.getChanges(log.oldValues, log.newValues),
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const log = await this.auditLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!log) {
      throw new NotFoundException(`Audit log #${id} not found`);
    }

    return {
      id: log.id,
      userId: log.userId,
      userName: log.user
        ? `${log.user.firstName} ${log.user.lastName}`
        : 'Unknown',
      userEmail: log.user?.email || 'N/A',
      tableName: log.tableName,
      recordId: log.recordId,
      action: log.action,
      oldValues: log.oldValues,
      newValues: log.newValues,
      changes: this.getChanges(log.oldValues, log.newValues),
      ipAddress: log.ipAddress,
      createdAt: log.createdAt,
    };
  }

  async getByRecord(tableName: string, recordId: number) {
    const logs = await this.auditLogRepository.find({
      where: { tableName, recordId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      userName: log.user
        ? `${log.user.firstName} ${log.user.lastName}`
        : 'Unknown',
      action: log.action,
      changes: this.getChanges(log.oldValues, log.newValues),
      createdAt: log.createdAt,
    }));
  }

  async getByUser(userId: number, query: QueryAuditLogsDto) {
    return this.findAll({ ...query, userId });
  }

  async getSummary() {
    // Get count by table
    const byTable = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.tableName', 'tableName')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.tableName')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Get count by action
    const byAction = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Get recent activity (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentCount = await this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.createdAt >= :date', { date: oneDayAgo })
      .getCount();

    // Get most active users
    const topUsers = await this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoin('audit.user', 'user')
      .select('audit.userId', 'userId')
      .addSelect("CONCAT(user.firstName, ' ', user.lastName)", 'userName')
      .addSelect('COUNT(*)', 'actionsCount')
      .groupBy('audit.userId')
      .addGroupBy('user.firstName')
      .addGroupBy('user.lastName')
      .orderBy('actionsCount', 'DESC')
      .limit(10)
      .getRawMany();

    const totalLogs = await this.auditLogRepository.count();

    return {
      total: totalLogs,
      recentActivity: {
        count: recentCount,
        period: 'Last 24 hours',
      },
      byTable,
      byAction,
      topUsers,
    };
  }

  private getChanges(
    oldValues: any,
    newValues: any,
  ): Array<{ field: string; oldValue: any; newValue: any }> {
    if (!oldValues && !newValues) return [];
    if (!oldValues) {
      return Object.keys(newValues || {}).map((key) => ({
        field: key,
        oldValue: null,
        newValue: newValues[key],
      }));
    }
    if (!newValues) {
      return Object.keys(oldValues || {}).map((key) => ({
        field: key,
        oldValue: oldValues[key],
        newValue: null,
      }));
    }

    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
    const allKeys = new Set([
      ...Object.keys(oldValues),
      ...Object.keys(newValues),
    ]);

    for (const key of allKeys) {
      const oldVal = oldValues[key];
      const newVal = newValues[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    }

    return changes;
  }
}
