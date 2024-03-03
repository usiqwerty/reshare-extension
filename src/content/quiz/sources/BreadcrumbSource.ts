import DataSource from "../../../shared/utils/DataSource";
import {removeInvisible} from "../../../shared/utils/strings";

class BreadcrumbSource extends DataSource {

    evaluate() {
        /** @type {String[]} */
        this.data.bcItems = [];

        const links = document.querySelectorAll(".breadcrumb a");
        const items = document.querySelectorAll(".breadcrumb-item");

        items.forEach((item:HTMLElement)=>{
            this.data.bcItems.push(removeInvisible(item.innerText));
        });


        links.forEach((link:HTMLLinkElement)=>{
            const url = new URL(link.href);

            // @ts-ignore
            if (url.pathname.includes("/course/view.php")) {
                if (this.data.courseName) return;//continue;

                /** @type {number} */
                this.data.courseId = parseInt(url.searchParams.get("id"));

                /** @type {String} */
                this.data.courseName = removeInvisible(link.innerText);
            }
            // @ts-ignore
            else if (url.pathname.includes("/mod/quiz/view.php")) {
                if (this.data.quizName) return;//continue;

                /** @type {number} */
                this.data.quizId = parseInt(url.searchParams.get("id"));

                /** @type {String} */
                this.data.quizName = removeInvisible(link.innerText);
            }
        });

    }
}

export default BreadcrumbSource;