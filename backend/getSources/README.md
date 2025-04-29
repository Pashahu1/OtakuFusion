
# get sources 

A other half API of hiAnime Project to extract Anime Info and streaming links 

to get full API use this repo [hiAnime](https://github.com/yahyaMomin/hianime-API)

## API Reference

#### Get all episodes 

```http
  GET /api/v1/episodes/:id
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `string` | **Required**. anime Id |


#### example = /api/v1/episodes/steins-gate-3

____________

#### Get servers

```http
  GET /api/v1/servers?episodeId=${episodeId}
```

| query     | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `episodeId`| `string` | **Required**. episodeId of episode |


#### example = /api/v1/servers?episodeId=watch/one-piece-100?ep=2142


#### Get episode source

```http
  GET /api/v1/source?episodeId=${episodeId}&server=${server}&category=${category}
```

| query     | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `episodeId`| `string` | **Required**. episodeId of episode|
| `server`   |  `string` | **Optional** , HD-1(default) , HD-2 
|`category` | `string` | **Optional** , sub(default) , dub |


#### example = /api/v1/source?episodeId=watch/one-piece-100?ep=2142&server=hd-2&category=dub


