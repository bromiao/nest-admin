import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as AdmZip from 'adm-zip';
import * as XmlJs from 'xml2js';
import { NGINX_PATH } from 'src/constants/auth.constants';

const homeDir = os.homedir();

export function unzip(bookPath, unzipPath) {
  const zip = new AdmZip(bookPath);
  zip.extractAllTo(unzipPath, true);
}

export function parseRootFile(unzipPath) {
  const containerFilePath = path.resolve(unzipPath, 'META-INF/container.xml');
  const containerXml = fs.readFileSync(containerFilePath, 'utf-8');

  console.log('containerXml:', containerXml);
  const { parseStringPromise } = XmlJs;
  return parseStringPromise(containerXml, { explicitArray: false }).then(
    (data) => {
      return data.container.rootfiles.rootfile['$']['full-path'];
    },
  );
}

export function parseContentOpf(unzipPath, filePath, fileName) {
  // 获取conten.opf路径
  const fullPath = path.resolve(unzipPath, filePath);
  const contentOpf = fs.readFileSync(fullPath, 'utf-8');
  // console.log('contentOpf:', contentOpf);
  const { parseStringPromise } = XmlJs;
  return parseStringPromise(contentOpf, { explicitArray: false }).then(
    async (data) => {
      // console.log('data:', data);
      const { metadata } = data.package;
      // console.log('metadata:', metadata);

      const title = metadata['dc:title'];
      const creator = metadata['dc:creator']['_'];
      const language =
        metadata['dc:language']?.['_'] ?? metadata['dc:language'];
      const rights = metadata['dc:rights'];
      const coverMeta = metadata.meta.find((item) => item.$.name === 'cover');
      const coverId = coverMeta.$.content;
      const manifest = data.package.manifest.item;
      const coverRes = manifest.find((item) => item.$.id === coverId);
      const dir = path.dirname(fullPath);
      const cover = path.resolve(dir, coverRes.$.href);

      console.log(`电子书信息:
        书名: ${title}
        作者: ${creator}
        语言: ${language}
        版权: ${rights}
        封面: ${cover}
        `);
      const rootDir = path.dirname(filePath);
      const content = await parseContent(dir, 'toc.ncx', rootDir, fileName);
      console.log('content:', content);

      return {
        title,
        creator,
        language,
        publisher: rights,
        cover,
        content,
        rootFile: filePath,
      };
    },
  );
}

export async function parseContent(
  contentDir,
  contentFilePath,
  rootDir,
  fileName,
) {
  const contentPath = path.resolve(contentDir, contentFilePath);
  const contentXml = fs.readFileSync(contentPath, 'utf-8');
  const { parseStringPromise } = XmlJs;
  const data = await parseStringPromise(contentXml, { explicitArray: false });
  const navMap = data.ncx.navMap.navPoint;
  const fileNameWithoutSuffix = fileName.replace('.epub', '');
  const navData = navMap.map((nav) => {
    const id = nav.$.id;
    const playOrder = nav.$.playOrder;
    const text = nav.navLabel.text;
    const href = nav.content.$.src;

    return {
      id,
      playOrder,
      text,
      href: `${fileNameWithoutSuffix}/${rootDir}/${href}`,
    };
  });

  return navData;
}

export function copyCoverImage(data, tmpDir) {
  const { cover } = data;
  if (!cover) {
    return;
  }
  const coverPathName = cover.replace(tmpDir + '/', '');
  const coverDir = path.resolve(homeDir, NGINX_PATH, 'cover');
  const coverNewPath = path.resolve(coverDir, coverPathName);
  // console.log(1111, coverPathName, coverNewPath);
  // const targetDir = path.dirname(coverNewPath);
  fse.mkdirpSync(coverDir);
  fse.copySync(cover, coverNewPath);
  return coverPathName;
}

export function copyUnzipBook(tmpDir, dirName) {
  const bookDir = path.resolve(homeDir, NGINX_PATH, 'book', dirName);
  fse.mkdirpSync(bookDir);
  fse.copySync(tmpDir, bookDir);
}
