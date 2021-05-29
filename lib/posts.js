import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import remark from 'remark'
import html from 'remark-html'

const postDirectory = path.join(process.cwd(), 'posts')

export async function getSortedPostsData(){
    //get file names under /posts
    const fileNames = fs.readdirSync(postDirectory)
    const allPostData = 
        await Promise.all(fileNames.map(async (fileName) => {
            const id = fileName.replace(/\.md$/, '')
            return await getPostData(id)
        })
    )

    return allPostData.sort((a, b) => {
        return a.date < b.date ? 1 : -1
    })
}

export function getAllPostIds(){
    const fileNames = fs.readdirSync(postDirectory)
    return fileNames.map(fileName => {
        return { params: { id : fileName.replace(/\.md$/, '') } }
    })
}

export async function getPostData(id){
    // read markdown file as string
    const fullPath = path.join(postDirectory, `${id}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // use remark to convert markdown into HTML string
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content)
    const contentHtml = processedContent.toString()

    // combine the data with id
    return {
        id,
        contentHtml,
        ...matterResult.data
    }
}