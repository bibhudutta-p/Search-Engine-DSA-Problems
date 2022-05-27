const express = require("express");
const ejs = require("ejs");
const path = require("path");
const { readFile } = require('fs/promises')
const converter = require('number-to-words');

const app = express();

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "/public")));

app.use(express.json());

const PORT = process.env.PORT || 3000;

async function content(path) {  // async function to call to read files
    return await readFile(path, 'utf8')
}

let q_body = new Array(3534);

let keywords, IDF, TFIDF, magnitude, titles, urls, idf_vec, magnitude_vec, TFIDF_lines, all_keywords, num_of_keywords, all_titles, all_urls;

async function get_q_text(){ // fucntion to read the contents of all the questions and store them in an array
    for (let i = 0; i < 3534; i++) {
        let question = await content(`./text/text${i}.txt`);
        q_body[i] = question.substring(8); 
    }
}

get_q_text();

async function get_all_docs(){
    keywords = await content("./keywords.txt");
    IDF = await content("./IDF.txt");
    TFIDF = await content("./TFIDF.txt");
    magnitude = await content("./magnitude.txt");
    titles = await content("./titles.txt");
    urls = await content("./urls.txt");

    idf_vec = IDF.split(" ");// array of all IDF values (as string)
    magnitude_vec = magnitude.split(" ");// array of all magnitudes (as string)
    TFIDF_lines = TFIDF.split("\n");// array to store all the lines of the TFIDF file as string
    all_keywords = keywords.split(" ");// array of all keywords
    num_of_keywords = 19955;// all_keywords.length precomputed
    all_titles = titles.split("\n");// array of all titles
    all_urls = urls.split("\n");// array of all urls
}

get_all_docs();

app.get("/", (req,res)=>{
    res.render("index");
})

let arr; // the final array we will be sending to the front end
let flag;// flag to show error page when user enters gibberish
let result_idx = new Array(5); //array to store the indices of the top 5 documents


app.get("/search", (req,res)=>{
    const q = req.query.question;
    
    

    //tf-idf goes here
    async function search_q(){
        
        let query_words = q.split(" "); // array of all words in user query

        function isNumeric(n) { // function to identify numbers in a string
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
        
        let num_of_words = query_words.length;
        for (let i = 0; i < num_of_words; i++){ // convert numbers to words like '1' to 'one' and remove capitalizations
            if(isNumeric(query_words[i])) { query_words[i] = converter.toWords(query_words[i]); } 
            query_words[i] = query_words[i].toLowerCase();
        }

        
        
        const unique_words = new Set(); // set to store unique words of the query
        query_words.forEach(element => {
            unique_words.add(element);
        });

        let query_keyword = {}; //object to store the index of the keywords of the query
        let tf_query_words = {}; //object to store the tf-idf values of the keywords of the query in the form <index of query keyword>:<tf-idf>
        let i = 0;
        for (let keyword of all_keywords){
            for (let word of unique_words){
                if (keyword === word) {
                    query_keyword[word] = i;
                    tf_query_words[query_keyword[word]] = 1; //initialize the elements that are present with 1| we will subtract 1 later
                }
            }
            i++;
        }

        // "tf" = 1,2,1...
        for (const word of query_words){
            if (tf_query_words[query_keyword[word]])
            //all words in query words may not be present in tf_query_words 
            //as the user can input anything
            //and also we have removed stop words in the database but not in the user query
                tf_query_words[query_keyword[word]]++;
        }

        for (const index in tf_query_words){ //subtract 1 to cancel the effect
            tf_query_words[index]--;
        }

        // tf =1/n,2/n,1/n...
        for (const index in tf_query_words){
            tf_query_words[index] = tf_query_words[index]/num_of_words;
        }

        // tfidf = 0.123,0.325,1.4...
        for (const index in tf_query_words){
            tf_query_words[index] = tf_query_words[index]*idf_vec[index];
        }

        let mod_square = 0;
        for (const index in tf_query_words){
           mod_square += Math.pow(tf_query_words[index], 2);
        }
        let mod = Math.sqrt(mod_square);

        let similarity = new Array(3534).fill(0);

        for (const line of TFIDF_lines){
            let vec = line.split(" ");
            for (const idx in tf_query_words){
                if (vec[1] == idx) {
                    similarity[vec[0]] += vec[2]*tf_query_words[idx];
                }
            }
        }

        

        // for loop to divide by magnitudes of tf-idf of query and doc vectors
        for (let i = 0; i < 3534; i++) {
            similarity[i] /= mod*magnitude_vec[i];
        }
        

        for (let i = 0; i < 5; i++) {
            let max_similarity = Math.max(...similarity);
            let idx_max = similarity.indexOf(max_similarity);
            result_idx[i] = idx_max;
            similarity[idx_max] = -1;
        }

        
        arr =
        [
            {
                title: all_titles[result_idx[0]],
                url: all_urls[result_idx[0]],
                text: q_body[result_idx[0]],

            },
            {
                title: all_titles[result_idx[1]],
                url: all_urls[result_idx[1]],
                text: q_body[result_idx[1]],

            },
            {
                title: all_titles[result_idx[2]],
                url: all_urls[result_idx[2]],
                text: q_body[result_idx[2]],
            },
            {
                title: all_titles[result_idx[3]],
                url: all_urls[result_idx[3]],
                text: q_body[result_idx[3]],
                
            },
            {
                title: all_titles[result_idx[4]],
                url: all_urls[result_idx[4]],
                text: q_body[result_idx[4]],
                
            },
            q,
            flag,
        ]
        
}
    
    
    search_q();
    if (result_idx[0]==-1) {
        arr.flag = 0;
    }
    else {
        arr.flag = 1;
    }


    res.json(arr);
})


app.listen(PORT, ()=>{
    console.log("Server is running on port "+PORT);
})
