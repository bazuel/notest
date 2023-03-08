const sass = require("sass");
const postcss = require("postcss")
const fs = require("fs")
const path = require("path")
const fastglob = require(`fast-glob`); // 11ty uses `fast-glob` internally
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const stat = fs.promises.stat

const { promisify } = require("util");
const execFile = promisify(require("child_process").execFile);


async function directoryEntries(dirName){
    const entries = await fastglob([`src/${dirName}/**/index.md`], { cwd: "." });
    return entries
}


const manageRelativeImages = async (changedFiles) => {
    for(const f of changedFiles){
        let fileFullPath = path.join(__dirname, f);
        const filePath = path.parse(fileFullPath)
        const content = fs.readFileSync(fileFullPath).toString()
        const matches = content.match(/permalink: (.*)/i)
        if(matches && matches.length > 0){
            const permalink = matches[1]
            const entries = await fastglob([`*.{jpg,jpeg,png,gif,webp,mp3,mp4,webm,ogg}`], { cwd: filePath.dir });
            for(let e of entries){
                const src = path.join(filePath.dir, e);
                const dst = path.join("dist", permalink, e);
                await fs.promises.copyFile(src, dst);
                console.log(`✓ ${e} ➞ ${dst}`)
            }
        }
    }
}
module.exports = function(eleventyConfig) {

    eleventyConfig.addPlugin(pluginRss);

    eleventyConfig.addFilter("sitemapDateTimeString", (dateObj) => {
        try {
            return dateObj.toISOString()
        } catch (e){
            return ""
        }
    });


    eleventyConfig.addCollection("blog", function(collection) {
        return collection.getFilteredByGlob("src/blog/**/*.md");
    });

    eleventyConfig.addCollection("books", function(collection) {
        return collection.getFilteredByGlob("src/books/**/*.md");
    });

    eleventyConfig.addCollection("pills", function(collection) {
        return collection.getFilteredByGlob("src/pills/**/*.md");
    });
    
    
    for(const dir of ["dist/assets/css"])
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    eleventyConfig.addPlugin(syntaxHighlight);
    eleventyConfig.addPassthroughCopy("src/assets/img");
    eleventyConfig.addPassthroughCopy("src/assets/fonts");
    eleventyConfig.setWatchJavaScriptDependencies(false);
    eleventyConfig.addWatchTarget("./src/");
    eleventyConfig.on('beforeWatch', manageRelativeImages)
    eleventyConfig.on('afterBuild', async ()=>{
        const foundBlogEntries = await directoryEntries("blog")
        await manageRelativeImages(foundBlogEntries)
        const foundBookEntries = await directoryEntries("books")
        await manageRelativeImages(foundBookEntries)
        const foundPillsEntries = await directoryEntries("pills")
        await manageRelativeImages(foundPillsEntries)
    })
    eleventyConfig.on("beforeBuild", () => {
        
        let result = sass.renderSync({
            file: "src/assets/css/styles.scss",
            sourceMap: false,
            outputStyle: "compressed",
        });
        console.log("SCSS compiled");

        let css = result.css.toString();
        
        postcss([
            require('postcss-import'),
            require('tailwindcss'),
            require('autoprefixer'),
            require('postcss-nested'),
            require('cssnano')
        ])
            .process( css, { from: "src/assets/css/styles.scss", to: "assets/css/styles.css"})
            .then((result) => {
                fs.writeFileSync("dist/assets/css/styles.css", result.css, (err) => {
                    if (err) throw err;
                    console.log("CSS optimized");
                });
            });
    });




    async function lastModifiedDate(filename) {
        try {
            const { stdout } = await execFile("git", [
                "log",
                "-1",
                "--format=%cd",
                filename,
            ]);
            return new Date(stdout);
        } catch (e) {
            console.error(e.message);
            // Fallback to stat if git isn't working.
            const stats = await stat(filename);
            return stats.mtime; // Date
        }
    }
    // Cache the lastModifiedDate call because shelling out to git is expensive.
    // This means the lastModifiedDate will never change per single eleventy invocation.
    const lastModifiedDateCache = new Map();
    eleventyConfig.addNunjucksAsyncFilter(
        "lastModifiedDate",
        function (filename, callback) {
            const call = (result) => {
                result.then((date) => callback(null, date));
                result.catch((error) => callback(error));
            };
            const cached = lastModifiedDateCache.get(filename);
            if (cached) {
                return call(cached);
            }
            const promise = lastModifiedDate(filename);
            lastModifiedDateCache.set(filename, promise);
            call(promise);
        }
    );
    
    
    return {
        dir: {
            input: './src',
            output: './dist'
        }
    }
};
