declare module 'unpacker-with-progress' {
    function unpack(src: string, dest: string, options: Options): Promise<Stats>


    interface Options {
        onprogress: (stats: Stats) => void,
        resume: boolean
    }

    interface Stats {
        /* running total of entries processed */
        entriesProcessed: number,
        /* percentage of extraction complete 0.0 - 1.0 */
        percent: number,
        /* number of entries skipped */
        skipped: number,
        /* number of files extracted */
        unpacked: number,
        /* Total number of entries */
        totalEntries: number,
         /* total number of bytes after extraction */
        total: number,
         /* running total of bytes written */
        loaded: number,
    }
    export = unpack
}