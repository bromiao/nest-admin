import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('book')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column({ nullable: true, length: 1024 })
  cover: string;

  @Column({ length: 1024 })
  title: string;

  @Column({ nullable: true, length: 1024 })
  author: string;

  @Column({ nullable: true })
  publisher: string;

  @Column({ nullable: true })
  bookId: string;

  @Column({ nullable: true })
  category: number;

  @Column({ nullable: true })
  categoryText: string;

  @Column({ nullable: true, length: 10 })
  language: string;

  @Column({ nullable: true })
  rootFile: string;

  @Column({ nullable: true })
  originalName: string;

  @Column({ nullable: true })
  filePath: string;

  @Column({ nullable: true })
  unzipPath: string;

  @Column({ nullable: true })
  coverPath: string;

  @Column({ nullable: true, length: 50 })
  createUser: string;

  @Column({ nullable: true, type: 'bigint' })
  createDt: number;

  @Column({ nullable: true, type: 'bigint' })
  updateDt: number;

  @Column({ type: 'tinyint', width: 1, unsigned: true, default: 0 })
  updateType: number;
}
