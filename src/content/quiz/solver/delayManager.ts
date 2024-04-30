import {Submission} from "./types";

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function calculateDelay(submissions: Submission[]) {
    const basicDelay = 2000;
    const complexityDelay = 30000 * complexity(submissions);
    const otherDelay = 10000 * Math.random();

    return basicDelay + complexityDelay + otherDelay;
}

function complexity(submissions: Submission[]) {
    /**
     * Calculate task complexity based on users' submissions
     * 0 - infinitely easy task
     * 1 - infinitely hard task
     * */
    if (submissions.length === 1)
        return 0.1;

    let answerSubmissions = submissions.map((v) => {
        return v.count
    });

    answerSubmissions.sort((a, b) => {
        return a - b
    });
    answerSubmissions.reverse();

    //Calculate how much top-answer is more popular than top-2 answer
    const top2difference = answerSubmissions[0] - answerSubmissions[1];

    //take value relative to top answer
    //the bigger difference the more certain is answer
    const certainty = top2difference / answerSubmissions[0];

    //if answer is uncertain, then task is hard
    return 1 - certainty;

}