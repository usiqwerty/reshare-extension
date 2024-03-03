import Log from "../../shared/debug/log";
import MultiSource from "../../shared/utils/MultiSource";
import BreadcrumbSource from "./sources/BreadcrumbSource";
import URLSource from "./sources/board/URLSource";

const page = new MultiSource(
    [new BreadcrumbSource(),
    new URLSource()]
);


const bcItems: string[] = page.get("bcItems");


const pageMetadata = {
    host: page.get("host") as string,
    course: {
        id: page.get("courseId") as number,
        name: page.get("courseName") as string
    },
    quiz: {
        id: page.get("quizId") as number,
        name: page.get("quizName") || bcItems[bcItems.length - 1] as string
    }
}

// Check if page can be served
let supported = true;

if (!pageMetadata.host)
    supported = false;
else if (!pageMetadata.quiz.id || !pageMetadata.quiz.name)
    supported = false;
else if (!pageMetadata.course.id || !pageMetadata.course.name)
    supported = false;

if (!supported) {
    throw new Error("BoardPage: NotSupported: Missing required parameters");
}

Log.info("BoardPage: Check passed");

chrome.runtime.sendMessage({ //browser
    type: "board-page-open",
    payload: { ...pageMetadata }
});
