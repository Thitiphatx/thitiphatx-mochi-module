import { PlaylistEpisodeServerFormatType, PlaylistEpisodeServerQualityType, PlaylistEpisodeServerResponse, PlaylistEpisodeSourcesRequest } from "@mochiapp/js/dist";
import { baseUrl } from "../utils/constants";
import * as cheerio from "cheerio";

export async function getPlaylistEpisodeServer(req: PlaylistEpisodeSourcesRequest): Promise<PlaylistEpisodeServerResponse> {
    const response = await request.get(`${baseUrl}/watch/${req.episodeId}`);
    const $ = cheerio.load(response.text());

    const embedURL = $('iframe.embed-responsive-item').attr('src');

    const response2 = await request.get(`${embedURL}`);
    const $2 = cheerio.load(response2.text());

    const id = $2.html().split("https://akuma-player.xyz/play/")[1].split(`\\"`)[0];

    return {
        headers: {},
        links: [
            {
                url: `https://files.akuma-player.xyz/view/${id}.m3u8`,
                format: PlaylistEpisodeServerFormatType.hsl,
                quality:PlaylistEpisodeServerQualityType.auto
            }
        ],
        skipTimes: [],
        subtitles: [],
    }

}