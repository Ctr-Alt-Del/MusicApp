import React from 'react';
import useAuth from './useAuth'
import { Form } from 'react-bootstrap'
import { useState, useEffect } from 'react'
import SpotifyWebApi from 'spotify-web-api-node'
import TrackSearchResult from './trackSearchResult'
import axios from "axios"
import Player from "./player"

const spotifyApi = new SpotifyWebApi({
    clientId: '5a86df01b4d143979952801e438f042b',
})

export default function Dashboard({ code }) {
    const accessToken = useAuth(code)
    const [search, setSearch] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [playingTrack, setPlayingTrack] = useState("")
    const [Lyrics, setLyrics] = useState("")

    function chooseTrack(track) {
        setPlayingTrack(track)
        setSearch("")
        setLyrics("")
    }

    useEffect(() => {
        if (!playingTrack) return
        axios.get("http://localhost:3001/lyrics", {
            params: {
                track: playingTrack.title,
                artist: playingTrack.artist,
            },
        })
            .then(res => {
                setLyrics(res.data.lyrics)
            })
    }, [playingTrack])

    useEffect(() => {
        if (!accessToken) return
        spotifyApi.setAccessToken(accessToken)
    }, [accessToken])

    useEffect(() => {
        if (!search) return setSearchResults([])
        if (!accessToken) return

        let cancel = false
        spotifyApi.searchTracks(search).then(res => {
            console.log(res)
            
            if (cancel) return
            setSearchResults(
                res.body.tracks.items.map(track => {
                    return {
                        artist: track.artists[0].name,
                        title: track.name,
                        uri: track.uri,
                        albumUrl: track.album.images[0].url,
                        // songId: track.album.id
                    }
                })
            )
        }).catch(err => {
            console.log(err)
            console.log("Error. No songs found.")
            console.log("Gotta create popup to display this message")
            
        })
        return () => cancel = true
    }, [search, accessToken])

    return (
        <div className="d-flex flex-column py-2" style={{ height: "auto" }}>
            <Form.Control type="search" placeholder="Search Songs/Artist" value={search} onChange={e => setSearch(e.target.value)} />
            <div class="display">
                <div class="row">
                    {searchResults.map((track) => {
                        console.log(track);
                        return (
                            <div class="col-sm-3 ">
                                <div class="songContainer">
                                    <TrackSearchResult
                                        track={track}
                                        key={track.uri}
                                        chooseTrack={chooseTrack} />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div>
                {searchResults.length === 0 && (
                        <div class="lyricsBox">
                            <p class="lyrics">
                                {Lyrics}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <div>
                <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
            </div>
        </div   >
    )
}