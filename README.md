> Small http render sever : send a 3d (stl, ctm, obj), get a nice static render back !

[![GitHub version](https://badge.fury.io/gh/usco%2Fthumbnail-render-server.svg)](https://badge.fury.io/gh/usco%2Fthumbnail-render-server)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)
[![Build Status](https://travis-ci.org/usco/thumbnail-render-server.svg)](https://travis-ci.org/usco/thumbnail-render-server)

<img src="https://raw.githubusercontent.com/usco/thumbnail-render-server/master/screenshot.png" />


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

###Server:
> Note : default port is 2210

> Also: the `npm start` command will run the server wraped by the forever tool, to ensure continued uptime

#### for production environments

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

#### managing existing running instances

List existing processes
```
  node_modules/forever/bin/forever list
```

Stop given process (with given ID)
```
  node_modules/forever/bin/forever stop ID
```

and then restart the correct one from the working directory using npm run start (see previous instructions)

###how to use as client:

- do a POST request with following parameters
   - resolution : in the form WIDTHxHEIGHT (the x is important)
   - camera position : [x,y,z] this the basis position (orbit camera) , and then a 'zoom to fit' algorithm is applied to try to fit as much of the object on screen as possible
   - inputFile : your STL, OBJ, CTM file (3MF coming up next, GCODE in a few weeks)

> IMPORTANT ! you MUST use form-data to send your data, and nothing else like x-www-form-urlencoded etc

> IMPORTANT ! NO compression & NO caching for now , so it does NOT keep files around between requests, please experiment with smaller files first , even if it can handle quite big ones too,( I tried 80MB max , that does take a while), I'll try to add at least some form of uploaded file caching soon

For clarity I included a screenshot of the parameters & a result in [postman](https://www.getpostman.com/) very practical for testing your camera angles

<img src="https://raw.githubusercontent.com/usco/thumbnail-render-server/master/screenshot.png" />

## Contribute

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.


## License

[The MIT License (MIT)](https://github.com/usco/thumbnail-render-server/blob/master/LICENSE)
(unless specified otherwise)
