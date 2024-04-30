export function getColor(correctness: number) {

    // Default correctness - unknown
    const color = {
        backColor: undefined,
        textColor: undefined
    }

    switch (correctness) {
        // Incorrect
        case 0:
            color.backColor = "#FAA0A0"; // Red #b81414
            color.textColor = "#FFFFFF"; // White
            break;

        // Partially correct
        case 1:
            color.backColor = "#FAC898"; // Orange #e66815
            color.textColor = "#FFFFFF"; // White
            break;

        // Correct
        case 2:
            color.backColor = "#A9D099"; // Green #369c14
            color.textColor = "#FFFFFF"; // White
            break;

        default:
            color.backColor = "#cfcfc4"; // Gray
            color.textColor = "#FFFFFF"; // White
            break;
    }

    return color;
}