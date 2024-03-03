// // import "@/core/umami.js";
// // import Mediator from "@/core/transport.js";
// //import QuestionHandler from "../content/question-handler.js";
// import PageMeta from "./page-parser";
// // import { log } from "@/core/log";
// // import * as MSG from "@/content/messages";
//
// const state = document.querySelector("#page-mod-quiz-review") ? "review" : "attempt";
// const meta = {...PageMeta, state };
//
// console.log("*Quiz* content script loaded !");
//
// for (const div of document.querySelectorAll("div.que")) {
//     QuestionHandler.handle(div);
// }
//
// if (meta.state === "review") {
//     console.log("This page is a review page");
//
//     Mediator.publish("review-data", {
//         meta: meta,
//         qdata: QuestionHandler.collectData(),
//     });
//
//     Mediator.publish("check-donation", { attemptId: meta.attemptId });
//
//     Mediator.subscribe("check-donation-result", data => {
//         if (data.show) {
//             MSG.showDonationMessage(settings => settings.reviewDelay, "review");
//         }
//     });
// }
// else
// {
//     console.log("This page is an attempt page");
//
//     QuestionHandler.requestAnswers(meta);
//
//     window.addEventListener("beforeunload", (e) => {
//         Mediator.publish("attempt-data", {
//             meta: meta,
//             qdata: QuestionHandler.collectData()
//         });
//     });
// }
//
