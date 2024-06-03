import { PlaylistItem, PlaylistItemsResponse } from "@mochiapp/js/dist";
import { baseUrl } from "../utils/constants";
import * as cheerio from "cheerio";

export async function getPlaylistEpisodes(id: string): Promise<PlaylistItemsResponse> {
    const response = await request.get(`${baseUrl}/anime/${id}`);
    const $ = cheerio.load(response.text());

    const episodes: PlaylistItem[] = [];

    $('#overview > div > div > div.mvcast-item > div.cast-it > div > div > a').map((index, ep) => {
        const id = $(ep).attr('href')?.split("/")[4] ?? ""
        episodes.push({
            id,
            number: index+1,
            tags: [],
        })
    })
    episodes.reverse();
    return [
        {
            id: "",
            number: 1,
            variants: [{
                id: "",
                title: "test",
                pagings: [
                    {
                        id: "",
                        items: episodes
                    }
                ]
            }]
        }
    ]
}