package main

import (
    "fmt"
    "os"
    "strconv"
    "math"
    "encoding/csv"
    "time"
    "sync"
)

type CensusGroup struct {
	population int
	latitude, longitude float64
}

func ParseCensusData(fname string) ([]CensusGroup, error) { //takes a string for fname, returns struct,error tuple
	file, err := os.Open(fname)
    if err != nil {
		return nil, err
    }
    defer file.Close() 

	records, err := csv.NewReader(file).ReadAll() //read given csv file, store in records
    if err != nil {
		return nil, err
	}
	censusData := make([]CensusGroup, 0, len(records)) //create a slice CensusGroup structs of size 0 initially, with max capacity to store all records read from file

    for _, rec := range records { //for every records read the population, latitude, longitude
        if len(rec) == 7 {
            population, err1 := strconv.Atoi(rec[4])
            latitude, err2 := strconv.ParseFloat(rec[5], 64)
            longitude, err3 := strconv.ParseFloat(rec[6], 64)
            if err1 == nil && err2 == nil && err3 == nil {
                latpi := latitude * math.Pi / 180
                latitude = math.Log(math.Tan(latpi) + 1 / math.Cos(latpi))
                censusData = append(censusData, CensusGroup{population, latitude, longitude})
            }
        }
    }

	return censusData, nil
}

func setup1(censusData []CensusGroup) (float64, float64, float64, float64, int) {
    //traverse the rect to get min,max latitudes and longitudes in O(n) time
    min_longitude, max_longitude, min_latitude, max_latitude := censusData[0].longitude, censusData[0].longitude, censusData[0].latitude, censusData[0].latitude
    var totalPop int
    for i,_ := range censusData{
        min_longitude = math.Min(censusData[i].longitude, min_longitude)
        max_longitude = math.Max(censusData[i].longitude, max_longitude)
        min_latitude = math.Min(censusData[i].latitude, min_latitude)
        max_latitude = math.Max(censusData[i].latitude, max_latitude)

        totalPop += censusData[i].population
    }
    
    return min_longitude, max_longitude, min_latitude, max_latitude, totalPop
}

func query1(censusData []CensusGroup, yfactor, xfactor, min_longitude, min_latitude float64, west, south, east, north int) int{
    // queried population initially 0
    queriedPop := 0
            
    for i,_ := range censusData { //checking every CensusGroup in censusData given if it is in the query box, and adding population if so
        xcoordi := int((censusData[i].longitude - min_longitude) * xfactor)
        ycoordi := int((censusData[i].latitude - min_latitude) * yfactor)
    
        if xcoordi >= west-1 && ycoordi >= south-1 && xcoordi <= east-1 && ycoordi <= north-1 { //in query box range
            queriedPop += censusData[i].population
        }
    }
    return queriedPop
}

func setup2(censusData []CensusGroup) (float64, float64, float64, float64, int) { //divide and run recursive calls in parallel O(logn)
    if len(censusData) == 1 { //base case
        return censusData[0].longitude, censusData[0].longitude, censusData[0].latitude, censusData[0].latitude, censusData[0].population //starting values for min max and population
    } else {
        mid := len(censusData)/2
        var min_longitudeL, max_longitudeL, min_latitudeL, max_latitudeL float64
        var min_longitudeR, max_longitudeR, min_latitudeR, max_latitudeR float64
        var totalPopR, totalPopL int
        done := make(chan bool)
        go func(){ //create and initiate anonymous function for the parallel recursive call
            min_longitudeL, max_longitudeL, min_latitudeL, max_latitudeL, totalPopL = setup2(censusData[:mid]) //left half
            done <- true //once done, pass true to channel
        }()
        go func(){ //create and initiate anonymous function for the parallel recursive call
            min_longitudeR, max_longitudeR, min_latitudeR, max_latitudeR, totalPopR = setup2(censusData[mid:]) //right half
            done <- true //once done, pass true
        }()
        <-done
        <-done
        //on traceback once both parallel calls are computed, compare left right values
        return math.Min(min_longitudeL, min_longitudeR), math.Max(max_longitudeL, max_longitudeR), math.Min(min_latitudeL, min_latitudeR), math.Max(max_latitudeL, max_latitudeR), (totalPopL+totalPopR) //add populations and filter out max mins on return
    }
}

func query2(censusData []CensusGroup, yfactor, xfactor, min_longitude, min_latitude float64, west, south, east, north int) int{ //O(logn)
    if len(censusData) == 1 { //base case
        xcoordi := int((censusData[0].longitude - min_longitude) * xfactor)
        ycoordi := int((censusData[0].latitude - min_latitude) * yfactor)
        if xcoordi >= west-1 && ycoordi >= south-1 && xcoordi <= east-1 && ycoordi <= north-1 { //in query box range
            return censusData[0].population
        }
        return 0 
    } else {
        mid := len(censusData)/2
        var queriedPopR, queriedPopL int
        done := make(chan bool)
        go func(){ //create and initiate anonymous function for the parallel recursive call
            queriedPopL = query2(censusData[:mid], yfactor, xfactor, min_longitude, min_latitude, west, south, east, north) //left half
            done <- true
        }()
        go func(){ 
            queriedPopR = query2(censusData[mid:], yfactor, xfactor, min_longitude, min_latitude, west, south, east, north) //right half
            done <- true
        }()
        <-done
        <-done
        //on traceback once both parallel calls are done, add queried populations
        return queriedPopL + queriedPopR //return sum of left and right queried populations
    }
}

func gridQuery(grid [][]int, north, west, east, south int) int{ //O(1)
    var BR, leftBL, diagTL, upTR int //0 initially
    BR = grid[north-1][east-1] //bottom right
    if (west-2 >= 0){
        leftBL = grid[north-1][west-2] 
    }
    if (south-2 >= 0){
        upTR = grid[south-2][east-1] 
    }
    if (west-2 >= 0 && south-2 >= 0){
        diagTL = grid[south-2][west-2] 
    }

    return BR - upTR - leftBL + diagTL
}

func gridSeqStep2(grid [][]int, ydim, xdim int){
    //traverse the grid, applying grid[i][j] += grid[i-1][j]+grid[i][j+1]-grid[i-1][j+1] (diagonal, upper and left value added to current)
    for i:= 0; i < ydim; i++ {
        for j:= 0; j < xdim; j++ {
            var left, up, diag int //initially all are 0
            if (i-1 >= 0){
                up = grid[i-1][j]
            }
            if (j-1 >= 0){
                left = grid[i][j-1]
            }
            if (j-1 >= 0 && i-1 >= 0){
                diag = grid[i-1][j-1]
            }
            grid[i][j] += left + up - diag
        }
    }
}

func createGrid(ydim, xdim int) [][]int{
    grid := make([][]int, ydim) //copy created for that region
    for i:= 0; i < ydim; i++ {
        grid[i] = make([]int, xdim)
    }
    return grid
}

/*
ymin xmin       ymin xmid
     ooo             ooo
     ooo             ooo
        ymid xmid       ymid xmax    

ymid xmin    ymid xmid
     ooo             ooo
     ooo             ooo
        ymax xmid       ymax xmax
*/
func parallelGridMerge(gridL, gridR [][]int, ymin, xmin, ymax, xmax int){ //inplace merging of gridR elements onto gridL elements
    ydim := ymax-ymin
    xdim := xmax-xmin
    //fmt.Println(ydim, xdim)
    if (ydim == 1 || xdim == 1){ //base case, both grids will have the same size - 1x1, 2x1 or 1x2 (add gridR to gridL)
        for i := ymin; i < ymax; i++ {
            for j := xmin; j < xmax; j++ {
                gridL[i][j] += gridR[i][j]
            }
        }
    } else {
        ymid := ydim / 2 + ymin
        xmid := xdim / 2 + xmin
        done := make(chan bool)
        go func(){
            parallelGridMerge(gridL, gridR, ymin, xmin, ymid, xmid) //TL
            done <- true
        }()
        go func(){
            parallelGridMerge(gridL, gridR, ymin, xmid, ymid, xmax) //TR
            done <- true
        }()
        go func(){
            parallelGridMerge(gridL, gridR, ymid, xmin, ymax, xmid) //BL
            done <- true
        }()
        go func(){
            parallelGridMerge(gridL, gridR, ymid, xmid, ymax, xmax) //BR
            done <- true
        }()
        <-done
        <-done
        <-done
        <-done
    }
}

func gridParallStep1_V4(censusData []CensusGroup, ydim, xdim int, yfactor, xfactor, min_latitude, min_longitude float64) [][]int { //grid passed empty initially
    if len(censusData) > 100 { //sequential cutoff
        mid := len(censusData)/2
        var gridL, gridR [][]int //to store grids recieved from the left and right recursive calls
        done := make(chan bool)
        go func(){
            gridL = gridParallStep1_V4(censusData[:mid], ydim, xdim, yfactor, xfactor, min_latitude, min_longitude)
            done <- true
        }()
        go func(){
            gridR = gridParallStep1_V4(censusData[mid:], ydim, xdim, yfactor, xfactor, min_latitude, min_longitude)
            done <- true
        }()
        <-done
        <-done    
        //merging grid from left call with grid from right call
        parallelGridMerge(gridL, gridR, 0, 0, ydim, xdim)
        return gridL
    } else {
        grid := createGrid(ydim, xdim) //empty x*y grid created
        
        for i,_ := range censusData {
            xcoordi := int((censusData[i].longitude - min_longitude) * xfactor)
            ycoordi := int((censusData[i].latitude - min_latitude) * yfactor)
            if (ycoordi == ydim){
                ycoordi--
            }
            if (xcoordi == xdim){
                xcoordi--
            }
            grid[ycoordi][xcoordi] += censusData[i].population
        }
        return grid
    }
}

func gridParallStep1_V5(censusData []CensusGroup, grid *[][]int, locksGrid *[][]sync.Mutex, ydim, xdim int, yfactor, xfactor, min_latitude, min_longitude float64){ //grid passed empty initially
    if len(censusData) > 10 { //sequential cutoff
        mid := len(censusData)/2
        done := make(chan bool)
        go func(){
            gridParallStep1_V5(censusData[:mid], grid, locksGrid, ydim, xdim, yfactor, xfactor, min_latitude, min_longitude)
            done <- true
        }()
        go func(){
            gridParallStep1_V5(censusData[mid:], grid, locksGrid, ydim, xdim, yfactor, xfactor, min_latitude, min_longitude)
            done <- true
        }()
        <-done
        <-done    
    } else {
        // instead of creating a new grid everytime, work on passed grid
        for i,_ := range censusData {
            xcoordi := int((censusData[i].longitude - min_longitude) * xfactor)
            ycoordi := int((censusData[i].latitude - min_latitude) * yfactor)
            if (ycoordi == ydim){
                ycoordi--
            }
            if (xcoordi == xdim){
                xcoordi--
            }
            (*locksGrid)[ycoordi][xcoordi].Lock()
            (*grid)[ycoordi][xcoordi] += censusData[i].population
            (*locksGrid)[ycoordi][xcoordi].Unlock()
        }
    }
}


func PrefixSumHorizontal(row []int, parent chan int){ //reusing lecture 5 code
	if len(row) > 1 {
		mid := len(row)/2
		left := make(chan int)
		right := make(chan int) //creating channels to store results from left and right calls
		go PrefixSumHorizontal(row[:mid], left) // left half passed
		go PrefixSumHorizontal(row[mid:], right) // right half passed
		
		leftSum := <-left //left recieved
		parent <- leftSum + <-right 
		
		fromLeft := <-parent
		left <- fromLeft
		right <- fromLeft + leftSum

		parent <- <-left + <-right //sum passed into parent
	} else{
		parent <- row[0]
		row[0] += <-parent //inplace overwriting of sum
		parent <- 0
	}
}

func PrefixSumVertical(grid [][]int, j int, parent chan int){
	if len(grid) > 1 { //row len > 1
		mid := len(grid)/2
		left := make(chan int)
		right := make(chan int) //creating channels to store results from left and right calls
		go PrefixSumVertical(grid[:mid], j, left) // left half passed
		go PrefixSumVertical(grid[mid:], j, right) // right half passed
		
		leftSum := <-left //left recieved
		parent <- leftSum + <-right 
		
		fromLeft := <-parent
		left <- fromLeft
		right <- fromLeft + leftSum

		parent <- <-left + <-right //sum passed into parent
	} else{
		parent <- grid[0][j] //working on that column
		grid[0][j] += <-parent //inplace overwriting of sum on col
		parent <- 0
	}
}

func gridParallStep2(grid [][]int, ydim, xdim int){
    for i:= 0; i < ydim; i++ { // calculate initiating horizontal prefix sums for every row grid[i] in parallel
        ch := make(chan int)
        go PrefixSumHorizontal(grid[i], ch) 
        <-ch
        ch<-0
        <-ch //grid[i] is ovewritten with the horizontal prefix sum result 
    }

    for j:= 0; j < xdim; j++ { // calculate initiating vertical prefix sums for every column grid[0][j] in parallel
        ch := make(chan int)
        go PrefixSumVertical(grid, j, ch) 
        <-ch
        ch<-0
        <-ch //grid[0][j] is ovewritten with the vertical prefix sum result 
    }
}

func main () {
    if len(os.Args) < 4 {
		fmt.Printf("Usage:\nArg 1: file name for input data\nArg 2: number of x-dim buckets\nArg 3: number of y-dim buckets\nArg 4: -v1, -v2, -v3, -v4, -v5, or -v6\n")
		return
	}
	fname, ver := os.Args[1], os.Args[4] //fname from input
    xdim, err := strconv.Atoi(os.Args[2]) //xdimension of grid from input
	if err != nil {
		fmt.Println(err)
		return
	}
    ydim, err := strconv.Atoi(os.Args[3]) //ydimension of grid from input
	if err != nil {
		fmt.Println(err)
		return
	}
    censusData, err := ParseCensusData(fname) //given file read for parsed census data
    if err != nil {
		fmt.Println(err)
		return
    }
        
    //create a dynamic rectangular 2D grid of given dimensions, all int, xdim * ydim
    var min_longitude, max_longitude, min_latitude, max_latitude float64
    var totalPop int
    grid := createGrid(ydim, xdim) //empty x*y grid created

    start := time.Now()
    // Some parts may need no setup code
    switch ver { //ver from input
    case "-v1":
        // YOUR SETUP CODE FOR PART 1
        min_longitude, max_longitude, min_latitude, max_latitude, totalPop = setup1(censusData)
    case "-v2":
        // YOUR SETUP CODE FOR PART 2
        min_longitude, max_longitude, min_latitude, max_latitude, totalPop = setup2(censusData)
    case "-v3":
        // YOUR SETUP CODE FOR PART 3
        // get min max pops like before
        min_longitude, max_longitude, min_latitude, max_latitude, totalPop = setup2(censusData)
         // additional preprocessing for O(1) queries
        
        //STEP 1
        // calculate coordinates using ratio, multiplied with grid dimensions accordingly (-1 since start from 0)
        yfactor := float64(ydim) / (max_latitude - min_latitude)
        xfactor := float64(xdim) / (max_longitude - min_longitude)
        
        //checking every CensusGroup in censusData given and adding its population to the respective grid position (i,j) / y,x
        for i,_ := range censusData { 
            xcoordi := int((censusData[i].longitude - min_longitude) * xfactor)
            ycoordi := int((censusData[i].latitude - min_latitude) * yfactor)
            if (ycoordi == ydim){
                ycoordi--
            }
            if (xcoordi == xdim){
                xcoordi--
            }
            grid[ycoordi][xcoordi] += censusData[i].population
        }
        
        //STEP 2 - O(xy)
        gridSeqStep2(grid, ydim, xdim)
    case "-v4":
        // YOUR SETUP CODE FOR PART 4
        
        //STEP 1 parallel
        // get min max pops like before
        min_longitude, max_longitude, min_latitude, max_latitude, totalPop = setup2(censusData)
        yfactor := float64(ydim) / (max_latitude - min_latitude)
        xfactor := float64(xdim) / (max_longitude - min_longitude)
        grid = gridParallStep1_V4(censusData, ydim, xdim, yfactor, xfactor, min_latitude, min_longitude)

        gridSeqStep2(grid, ydim, xdim) //STEP 2 remains the same
    case "-v5":
        // YOUR SETUP CODE FOR PART 5
        min_longitude, max_longitude, min_latitude, max_latitude, totalPop = setup2(censusData)
        locksGrid := make([][]sync.Mutex, ydim) //copy created for that region
        for i:= 0; i < ydim; i++ {
            locksGrid[i] = make([]sync.Mutex, xdim)
        }
        // all goroutines will work on the same 'grid'
        yfactor := float64(ydim) / (max_latitude - min_latitude)
        xfactor := float64(xdim) / (max_longitude - min_longitude)
        gridParallStep1_V5(censusData, &grid, &locksGrid, ydim, xdim, yfactor, xfactor, min_latitude, min_longitude)
        
        gridSeqStep2(grid, ydim, xdim) //STEP 2 remains the same
    case "-v6":
        // YOUR SETUP CODE FOR PART 6
        min_longitude, max_longitude, min_latitude, max_latitude, totalPop = setup2(censusData)
        locksGrid := make([][]sync.Mutex, ydim) //copy created for that region
        for i:= 0; i < ydim; i++ {
            locksGrid[i] = make([]sync.Mutex, xdim)
        }
        // all goroutines will work on the same 'grid'
        yfactor := float64(ydim) / (max_latitude - min_latitude)
        xfactor := float64(xdim) / (max_longitude - min_longitude)
        gridParallStep1_V5(censusData, &grid, &locksGrid, ydim, xdim, yfactor, xfactor, min_latitude, min_longitude)

        //compute all horizontal prefix sums for every i value and then vertical for every j value, grid is overwritten
        gridParallStep2(grid, ydim, xdim)
    default:
        fmt.Println("Invalid version argument")
        return
    }

    fmt.Println("Min Longitude", min_longitude)
    fmt.Println("Max Longitude", max_longitude)
    fmt.Println("Min Latitude", min_latitude)
    fmt.Println("Max Latitude", max_latitude)
    fmt.Println("Total Population", totalPop)
    elapsed := time.Since(start)
    fmt.Println("Setup took", elapsed)

    for {
        // fmt.Println("Enter query (w,s,e,n): ")
        var west, south, east, north int
        n, err := fmt.Scanln(&west, &south, &east, &north)
        if n != 4 || err != nil || west<1 || west>xdim || south<1 || south>ydim || east<west || east>xdim || north<south || north>ydim {
            break
        }

        var population int
        var percentage float64
        switch ver {
        case "-v1":
            // YOUR QUERY CODE FOR PART 1
            //calculating size for rect divisions in grid
            yfactor := float64(ydim) / (max_latitude - min_latitude)
            xfactor := float64(xdim) / (max_longitude - min_longitude)
    
            population = query1(censusData, yfactor, xfactor, min_longitude, min_latitude, west, south, east, north)
        case "-v2":
            // YOUR QUERY CODE FOR PART 2
            //calculating size for rect divisions in grid
            yfactor := float64(ydim) / (max_latitude - min_latitude)
            xfactor := float64(xdim) / (max_longitude - min_longitude)
            
            population = query2(censusData, yfactor, xfactor, min_longitude, min_latitude, west, south, east, north)
        case "-v3":
            // YOUR QUERY CODE FOR PART 3
            population = gridQuery(grid, north, west, east, south)
        case "-v4":
            // YOUR QUERY CODE FOR PART 4
            population = gridQuery(grid, north, west, east, south)
        case "-v5":
            // YOUR QUERY CODE FOR PART 5
            population = gridQuery(grid, north, west, east, south)
        case "-v6":
            // YOUR QUERY CODE FOR PART 6
            population = gridQuery(grid, north, west, east, south)
        }

        percentage = float64(population)/float64(totalPop)*100.0

        fmt.Printf("%v %.2f%%\n", population, percentage)
    }
}
