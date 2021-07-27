
var routes = []
var distances = []

function pathfinder(origin, dest, current, dist) {
    if (origin == dest) {
        routes.push(current)
        distances.push(dist)
        return 
    }

    var originObj = nodesJSON.find(node => {
        return node.City == origin
    })

    var l = originObj.Links
    var d = originObj.Distance

    for (item of l) {
        var i = l.indexOf(item)
        
        if (item == dest) {
            routes.push(current.concat([item]))
            distances.push(dist + d[i])
            return
        }

        if (current.includes(item)) {
            continue
        }

        pathfinder(item, dest, current.concat([item]), dist + d[i])
    }
}
