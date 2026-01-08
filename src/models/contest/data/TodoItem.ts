export class TodoItem {
    startTime: string;
    endTime: string;
    text: string;
    desc: string;

    constructor(startTime: string, endTime: string, text: string, desc: string) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.text = text;
        this.desc = desc;
    }
}
