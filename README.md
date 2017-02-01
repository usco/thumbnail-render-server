> Small http render sever : send a 3d (stl, ctm, obj), get a nice static render back !

[![GitHub version](https://badge.fury.io/gh/usco%2Fthumbnail-render-server.svg)](https://badge.fury.io/gh/usco%2Fthumbnail-render-server)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)
[![Build Status](https://travis-ci.org/usco/thumbnail-render-server.svg)](https://travis-ci.org/usco/thumbnail-render-server)

## Table of Contents

- [Background](#background)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Background

- server to generate static images from a given 3d model

> Note: currently you need to have an opengl capable (but it can be headless) machine to be able
to generate the images : uses xvfb-run under the hood, when it is available, but can run without it

## Installation

Not yet on NPM , will be soon
```
git clone git@github.com:usco/thumbnail-render-server.git
```
go into the clone folder and then
```
npm install
```


## Usage


> Note : default port is 2210

> Also: the `npm start` command will run the server wraped by the forever tool, to ensure continued uptime

### for production environments

```
  npm start -- port=5252
```

You can stop the server at anytime using

```
  npm stop
```

> if you only want to do small tests, you can launch the server without `forever`:

```
  node launch-server.js
```

### managing existing running instances

List existing processes
```
  node_modules/forever/bin/forever list
```

Stop given process (with given ID)
```
  node_modules/forever/bin/forever stop ID
```

and then restart the correct one from the working directory using npm run start (see previous instructions)

## Contribute

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.


## License

[The MIT License (MIT)](https://github.com/usco/thumbnail-render-server/blob/master/LICENSE)
(unless specified otherwise)
