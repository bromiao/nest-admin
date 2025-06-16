import * as path from 'path';
import * as os from 'os';
import * as fse from 'fs-extra';
import {
  copyCoverImage,
  copyUnzipBook,
  parseContentOpf,
  parseRootFile,
  unzip,
} from './epub-parse';

const TEMP_PATH = '.vben/tmp-book';
export class EpubBook {
  private bookPath;
  private file;

  constructor(bookPath: string, file: File) {
    this.bookPath = bookPath;
    this.file = file;
  }

  async parse() {
    console.log('电子书解析', this.bookPath, this.file);
    // 1. 生成临时文件
    const homeDir = os.homedir();
    const tmpDir = path.resolve(homeDir, TEMP_PATH);
    const tmpFile = path.resolve(tmpDir, this.file.originalname);
    console.log('临时文件', tmpFile);
    fse.copySync(this.bookPath, tmpFile);
    // 2. epub电子书解析
    const tmpUnzipDirName = this.file.originalname.replace('.epub', '');
    const tmpUnzipDir = path.resolve(tmpDir, tmpUnzipDirName);
    fse.mkdirpSync(tmpUnzipDir);
    unzip(this.bookPath, tmpUnzipDir);
    // 3. epub root file解析
    const rootFile = await parseRootFile(tmpUnzipDir);
    console.log('rootFile', rootFile);
    // 4. epub content opf解析
    const bookData = await parseContentOpf(tmpUnzipDir, rootFile, this.file.originalname);
    // 5. 拷贝电子书封面图片到静态资源目录
    const cover = copyCoverImage(bookData, tmpDir);
    bookData.cover = cover;
    // 6. 拷贝解压后电子书
    copyUnzipBook(tmpUnzipDir, tmpUnzipDirName);
    // 7. 删除临时文件
    fse.removeSync(tmpFile);
    fse.removeSync(tmpUnzipDir);
    console.log('删除临时文件', tmpFile, tmpUnzipDir);
    console.log('电子书解析完成✅');
    return bookData;
  }
}
