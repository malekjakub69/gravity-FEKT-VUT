export class LineBreakTransformer {
    private chunks: string = "";

    transform(chunk: string, controller: TransformStreamDefaultController<string>) {
        this.chunks += chunk;
        const lines = this.chunks.split(/\r\n|[\n\r]/);
        this.chunks = lines.pop() ?? "";
        for (const line of lines) controller.enqueue(line);
    }

    flush(controller: TransformStreamDefaultController<string>) {
        if (this.chunks) controller.enqueue(this.chunks);
    }
}
