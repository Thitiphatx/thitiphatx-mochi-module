import { PlaylistDetails } from "@mochiapp/js/dist";
import { baseUrl } from "../utils/constants";
import * as cheerio from "cheerio";

export async function getPlaylistDetails(id: string): Promise<PlaylistDetails> {
    const response = await request.get(`${baseUrl}/anime/${id}`);
    const $ = cheerio.load(response.text());
    const synopsis = $('#overview > div > div > p:nth-child(1)').text().trim();

    return {
        synopsis,
        altTitles: [],
        altPosters: [],
        altBanners: [],
        genres: [],
        previews: [],
    } satisfies PlaylistDetails
}