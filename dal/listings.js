const { Puzzle, Theme, Size, AgeGroup, DifficultyLevel, Material, Tag } = require('../models')

// Get all Themes
async function getThemes() {
    return await Theme.fetchAll().map(theme => [theme.get('id'), theme.get('name')])
}

// Get all Sizes
async function getSizes() {
    return await Size.fetchAll().map(size => [size.get('id'), size.get('pieces')])
}

// Get All Age Groups
async function getAgeGroups() {
    return AgeGroup.fetchAll().map(age => [age.get('id'), age.get('name')])
}

// Get All Difficulty Levels
async function getDifficultyLevels() {
    return DifficultyLevel.fetchAll().map(level => [level.get('id'), level.get('name')])
}

// Get All Materials
async function getMaterials() {
    return Material.fetchAll().map(material => [material.get('id'), material.get('type')])
}

// Get All Tags
async function getTags() {
    return Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);
}

// Get All Puzzles
async function getAllPuzzles() {
    return await Puzzle.collection().fetch({
        withRelated: ['Theme', 'Size', 'AgeGroup', 'DifficultyLevel', 'Material', 'Tag']
    })
}

// Get only Puzzle ID and Title
async function getPuzzleIDandTitle() {
    return await Puzzle.fetchAll().map(puzzle => [puzzle.get('id'), puzzle.get('title')])
}

// Get Puzzle by ID and stock count
async function getPuzzleByID(puzzleId) {
    return await Puzzle.where({
        'id': puzzleId
    }).fetch()
}


module.exports = { getThemes, getSizes, getAgeGroups, getDifficultyLevels, getMaterials, getTags, getAllPuzzles,
                getPuzzleIDandTitle, getPuzzleByID }
