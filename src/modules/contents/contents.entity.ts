import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('contents')
export class Contents {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  fileName: string;

  @Column({ type: 'varchar', length: 100 })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  href: string;

  @Column({ type: 'int', nullable: true })
  order: number;

  @Column({ type: 'int', nullable: true })
  level: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  text: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  label: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pid: string;

  @PrimaryColumn({ type: 'varchar', length: 100 })
  navId: string;
}
