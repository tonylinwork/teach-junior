
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { execSync } from 'child_process';
import { runParse } from './scripts/parse_quiz.js';
import { parseTxt } from './scripts/parse_txt.js';




const convertMetafileToPng = (filePath) => {
    if (!filePath.toLowerCase().endsWith('.x-wmf') && !filePath.toLowerCase().endsWith('.x-emf') &&
        !filePath.toLowerCase().endsWith('.wmf') && !filePath.toLowerCase().endsWith('.emf')) return null;

    const pngPath = filePath.replace(/\.(x-wmf|x-emf|wmf|emf)$/i, '.png');

    // Use high DPI rendering at original size for crisp display
    const psCommand = `
        Add-Type -AssemblyName System.Drawing;
        $metafile = New-Object System.Drawing.Imaging.Metafile('${filePath}');
        $width = [int]$metafile.Width;
        $height = [int]$metafile.Height;
        $bitmap = New-Object System.Drawing.Bitmap($width, $height);
        $bitmap.SetResolution(192, 192);
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap);
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias;
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic;
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality;
        $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit;
        $graphics.Clear([System.Drawing.Color]::White);
        $graphics.DrawImage($metafile, 0, 0, $width, $height);
        $bitmap.Save('${pngPath}', [System.Drawing.Imaging.ImageFormat]::Png);
        $graphics.Dispose();
        $bitmap.Dispose();
        $metafile.Dispose();
    `.replace(/\n/g, ' ').replace(/\s+/g, ' ');

    try {
        console.log(`Converting ${filePath} to high-quality PNG...`);
        execSync(`powershell -Command "${psCommand}"`);
        if (fs.existsSync(pngPath)) {
            fs.unlinkSync(filePath);
            return pngPath;
        }
    } catch (e) {
        console.error('Image conversion failed:', e);
    }
    return null;
};

export function importQuizPlugin() {
    return {
        name: 'import-quiz-plugin',
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                if (req.url === '/api/import-chapter' && req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });

                    req.on('end', async () => {
                        try {
                            const data = JSON.parse(body);
                            const { chapterId, title, isDocx, isTxt, docxContent, txtContent, htmlContent, images } = data;

                            let finalHtmlPath = '';
                            const imgDir = path.resolve(process.cwd(), `public/assets/images_ans/${chapterId}`);
                            if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

                            const rawDir = path.resolve(process.cwd(), 'src/data/raw');
                            if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });

                            if (isDocx && docxContent) {
                                // 1. Convert Word to HTML using mammoth
                                let buffer = Buffer.from(docxContent, 'base64');
                                const tempInputPath = path.resolve(rawDir, `${chapterId}_input.${data.fileName?.split('.').pop() || 'docx'}`).replace(/\\/g, '/');
                                fs.writeFileSync(tempInputPath, buffer);

                                try {
                                    const psScript = `
                                        $ErrorActionPreference = 'Continue'
                                        $word = New-Object -ComObject Word.Application
                                        $word.Visible = $false
                                        $word.DisplayAlerts = 0
                                        try {
                                            $doc = $word.Documents.Open("${tempInputPath}")
                                            $macros = @("MathType.ConvertEquations", "MTCommand_ConvertEquations", "ConvertEquations")
                                            foreach ($macro in $macros) {
                                                try {
                                                    $word.Run($macro, "LaTeX 2.09 and later", [ref]$false, [ref]$true, [ref]$false, [ref]$false)
                                                    break
                                                } catch {
                                                    try {
                                                        $word.Run($macro, "LaTeX 2.09 and later", $false, $true, $false, $false)
                                                        break
                                                    } catch {}
                                                }
                                            }
                                            $doc.SaveAs("${tempInputPath}.docx", 16)
                                            $doc.Close()
                                        } finally {
                                            $word.Quit()
                                            [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
                                        }
                                    `.trim();
                                    const tempPs1Path = path.resolve(rawDir, `${chapterId}_convert.ps1`);
                                    fs.writeFileSync(tempPs1Path, psScript, { encoding: 'utf8' });
                                    execSync(`powershell -ExecutionPolicy Bypass -File "${tempPs1Path}"`, { stdio: 'inherit' });
                                    if (fs.existsSync(`${tempInputPath}.docx`)) {
                                        buffer = fs.readFileSync(`${tempInputPath}.docx`);
                                        fs.unlinkSync(`${tempInputPath}.docx`);
                                    }
                                    fs.unlinkSync(tempPs1Path);
                                } catch (e) { }

                                const options = {
                                    convertImage: mammoth.images.inline((element) => {
                                        return element.read().then((imageBuffer) => {
                                            const extension = element.contentType.split('/')[1];
                                            let name = `image_${Date.now()}.${extension}`;
                                            const imgPath = path.join(imgDir, name);
                                            fs.writeFileSync(imgPath, imageBuffer);
                                            if (name.match(/\.(x-wmf|x-emf)$/i)) {
                                                const pngPath = convertMetafileToPng(imgPath);
                                                if (pngPath) name = path.basename(pngPath);
                                            }
                                            return { src: name };
                                        });
                                    })
                                };
                                const result = await mammoth.convertToHtml({ buffer }, options);
                                finalHtmlPath = path.resolve(process.cwd(), `src/data/raw/${chapterId}_ans.html`);
                                fs.writeFileSync(finalHtmlPath, result.value);
                            } else if (isTxt && txtContent) {
                                const quizData = parseTxt(txtContent, chapterId, title);
                                const outputPath = path.resolve(process.cwd(), `src/data/${chapterId}.json`);
                                fs.writeFileSync(outputPath, JSON.stringify(quizData, null, 2));
                                fs.writeFileSync(path.resolve(process.cwd(), `src/data/raw/${chapterId}_raw.txt`), txtContent);
                            } else {
                                finalHtmlPath = path.resolve(process.cwd(), `src/data/raw/${chapterId}_ans.html`);
                                fs.writeFileSync(finalHtmlPath, htmlContent);
                                for (const img of images) {
                                    const imgPath = path.join(imgDir, img.name);
                                    fs.writeFileSync(imgPath, Buffer.from(img.data, 'base64'));
                                    convertMetafileToPng(imgPath);
                                }
                            }

                            if (!isTxt) {
                                const outputPath = `src/data/${chapterId}.json`;
                                await runParse(finalHtmlPath, outputPath, title, chapterId);
                            }

                            const chaptersPath = path.resolve(process.cwd(), 'src/data/chapters.json');
                            let chapters = fs.existsSync(chaptersPath) ? JSON.parse(fs.readFileSync(chaptersPath, 'utf8')) : [];
                            const index = chapters.findIndex(ch => ch.id === chapterId);
                            if (index >= 0) chapters[index].title = title;
                            else chapters.push({ id: chapterId, title });
                            fs.writeFileSync(chaptersPath, JSON.stringify(chapters, null, 2));

                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ success: true, message: `Chapter ${chapterId} imported.` }));
                        } catch (error) {
                            console.error('Import error:', error);
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: error.message }));
                        }
                    });
                } else if (req.url === '/api/delete-chapter' && req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => { body += chunk.toString(); });
                    req.on('end', () => {
                        try {
                            const { chapterId } = JSON.parse(body);
                            const pathsToDelete = [
                                path.resolve(process.cwd(), `src/data/${chapterId}.json`),
                                path.resolve(process.cwd(), `src/data/raw/${chapterId}_ans.html`),
                                path.resolve(process.cwd(), `public/assets/images_ans/${chapterId}`)
                            ];
                            pathsToDelete.forEach(p => {
                                if (fs.existsSync(p)) {
                                    if (fs.lstatSync(p).isDirectory()) fs.rmSync(p, { recursive: true, force: true });
                                    else fs.unlinkSync(p);
                                }
                            });
                            const chaptersPath = path.resolve(process.cwd(), 'src/data/chapters.json');
                            if (fs.existsSync(chaptersPath)) {
                                let chapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
                                chapters = chapters.filter(ch => ch.id !== chapterId);
                                fs.writeFileSync(chaptersPath, JSON.stringify(chapters, null, 2));
                            }
                            res.statusCode = 200;
                            res.end(JSON.stringify({ success: true }));
                        } catch (error) {
                            res.statusCode = 500; res.end(JSON.stringify({ error: error.message }));
                        }
                    });
                } else if (req.url === '/api/list-chapters' && req.method === 'GET') {
                    try {
                        const dataDir = path.resolve(process.cwd(), 'src/data');
                        const files = fs.existsSync(dataDir) ? fs.readdirSync(dataDir) : [];
                        const chapters = files.filter(f => f.endsWith('.json') && f !== 'chapters.json').map(f => {
                            try {
                                const id = f.replace('.json', '');
                                const content = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
                                return { id, title: content.title || id };
                            } catch (e) { return null; }
                        }).filter(ch => ch !== null);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(chapters));
                    } catch (error) {
                        res.statusCode = 500; res.end(JSON.stringify({ error: error.message }));
                    }
                } else if (req.url === '/api/update-question' && req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => { body += chunk.toString(); });
                    req.on('end', async () => {
                        try {
                            const { chapterId, questionId, content, answer, explanation } = JSON.parse(body);
                            const filePath = path.resolve(process.cwd(), `src/data/${chapterId}.json`);
                            const quizData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                            let found = false;
                            for (const section of quizData.sections) {
                                const qIndex = section.questions.findIndex(q => q.id === questionId);
                                if (qIndex !== -1) {
                                    section.questions[qIndex] = { ...section.questions[qIndex], content, answer, explanation };
                                    found = true; break;
                                }
                            }
                            fs.writeFileSync(filePath, JSON.stringify(quizData, null, 2));
                            res.statusCode = 200; res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ success: true }));
                        } catch (error) {
                            res.statusCode = 500; res.end(JSON.stringify({ error: error.message }));
                        }
                    });
                } else {
                    next();
                }
            });
        }
    };
}
