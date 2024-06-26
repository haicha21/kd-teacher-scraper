import { JSDOM } from 'jsdom';
import {ITeacher} from "./models/ITeacher";

function extractTitleAndName(nameElement: Element): string[]
{
    const contents: string[] = nameElement.innerHTML.split(/(?=[\S])<!-- -->/)

    let prefix: string = ""
    if(contents[1] === " ")
        prefix = contents[0]

    return [prefix, contents[prefix === "" ? 1 : 2], contents[prefix === "" ? 2 : 3]]
}

async function getTeachersOfKaindorf(): Promise<ITeacher[]> {
    return await fetch("https://www.htl-kaindorf.at/schule/team")
        .then((res: Response) => res.text())
        .then((html: string) => new JSDOM(html))
        .then((dom: JSDOM) => {
            const teachers: ITeacher[] = []

            const root = dom.window.document.body.getElementsByTagName("section")[0]
            const divs = root.children
            const teacherDivs: Element[] = Array.from(divs[divs.length - 1].children)

            // Get data for regular teachers
            for (const teacherDiv of teacherDivs) {
                const children: HTMLCollectionOf<HTMLDivElement> = teacherDiv.getElementsByTagName("div")
                const imgUrl: string = decodeURIComponent(children[0].getElementsByTagName("img")[0]!.getAttribute("srcset")!.split("url=")[1].split("&w=")[0])

                const mail: string = children[1].getElementsByTagName("a")[0]!.getAttribute("href")!.split(":")[1]
                const shorthand: string = children[1].getElementsByTagName("div")[0].innerHTML.split(">")[1].split("<")[0].toUpperCase()
                const names: string[] = extractTitleAndName(children[1].getElementsByTagName("a")[0])

                teachers.push({
                    imageUrl: imgUrl,
                    prefix: names[0],
                    name: names[1],
                    postfix: names[2],
                    shorthand: shorthand,
                    email: mail
                })
            }

            // Get data for department head and headmaster
            for (let i: number = 2; i < divs.length - 4; i += 2) {
                while (i === 3 || i === 4)
                    i++
                const imgUrl: string = decodeURIComponent(divs[i].getElementsByTagName("div")![0].getElementsByTagName("img")![0].getAttribute("srcset")!.split("url=")[1].split("&w=")[0])

                const mail: string = divs[i + 1].getElementsByTagName("a")[0].getAttribute("href")!.split(":")[1]
                const shorthand: string = divs[i + 1].getElementsByTagName("span")[0].innerHTML.split(">")[1].split("<")[0].toUpperCase()
                const names: string[] = extractTitleAndName(divs[i + 1].getElementsByTagName("div")[1])

                teachers.push({
                    imageUrl: imgUrl,
                    prefix: names[0],
                    name: names[1],
                    postfix: names[2],
                    shorthand: shorthand,
                    email: mail
                })
            }
            return teachers
        })
}

export default getTeachersOfKaindorf