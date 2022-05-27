const express = require("express");
const ejs = require("ejs");
const path = require("path");
const { readFile } = require('fs/promises')
const converter = require('number-to-words');
// var spelling = require('./'),
//     dictionary = require('./dictionaries/en_US.js');

// var dict = new spelling(dictionary);



async function content(path) {  
  return await readFile(path, 'utf8')
}
const app = express();
// app.use('/favicon.ico', express.static('public/favicon.ico'));

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "/public")));

app.use(express.json());

const PORT = process.env.PORT || 3000;

let q_body = new Array(3534);

let keywords, IDF, TFIDF, magnitude, titles, urls;

let idf_vec, magnitude_vec, TFIDF_lines, all_keywords, num_of_keywords, all_titles, all_urls;

async function get_q_text(){
    for (let i = 0; i < 3534; i++) {
        let question = await content(`./text/text${i}.txt`);
        q_body[i] = question.substring(8); 
        // q_body[i] = question;
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

let arr;
let flag;// flag to show error page when user enter gibberish
let result_idx = new Array(5); //array to store the indices of the top 5 documents


app.get("/search", (req,res)=>{
    const q = req.query.question;
    
    

    //tf-idf goes here
    async function search_q(){
        

        // Read the 4 .txt files
        // keywords = await fs.readFile(__dirname+"./keywords.txt");
        // IDF = await fs.readFile(__dirname+"./IDF.txt");
        // TFIDF = await fs.readFile(__dirname+"./TFIDF.txt");
        // magnitude = await fs.readFile(__dirname+"./magnitude.txt");
        // titles = await fs.readFile(__dirname+"./titles.txt");
        // urls = await fs.readFile(__dirname+"./urls.txt");
        

        // let x = 1;
        // let question = await content(`./text/text${x}.txt`);
        // console.log(question);

        // console.log(q_body[0]);






        
        // keywords = await content(__dirname+"./keywords.txt");
        // IDF = await content(__dirname+"./IDF.txt");
        // TFIDF = await content(__dirname+"./TFIDF.txt");
        // magnitude = await content(__dirname+"./magnitude.txt");
        // titles = await content(__dirname+"./titles.txt");
        // urls = await content(__dirname+"./urls.txt");

        
        // let idf_vec = IDF.toString().split(" ");// array of all IDF values (as string)
        // let magnitude_vec = magnitude.toString().split(" ");// array of all magnitudes (as string)
        // let TFIDF_lines = TFIDF.toString().split("\n");// array to store all the lines of the TFIDF file as string
        // let all_keywords = keywords.toString().split(" ");// array of all keywords
        // let num_of_keywords = 19955;// all_keywords.length precomputed
        // let all_titles = titles.toString().split(" ");// array of all titles
        // let all_urls = urls.toString().split(" ");// array of all urls
        

        let query_words = q.split(" ");// array of all words in user query

        function isNumeric(n) {// function to identify numbers in a string
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
        
        let num_of_words = query_words.length;
        for (let i = 0; i < num_of_words; i++){// convert numbers to words like '1' to 'one' and remove capitalizations
            if(isNumeric(query_words[i])) { query_words[i] = converter.toWords(query_words[i]); } 
            query_words[i] = query_words[i].toLowerCase();
            // let spell_check = dict.lookup(query_words[i]);
            // if(!spell_check.found){
            //     query_words[i] = spell_check.suggestions[0];
            // }
        }

        
        
        const unique_words = new Set();// set to store unique words of the query
        query_words.forEach(element => {
            unique_words.add(element);
        });
        console.log(unique_words);

        /*****************ALL OK TILL HERE*******************/

        let query_keyword = {}; //object to store the index of the keywords of the query
        let tf_query_words = {};//object to store the tf-idf values of the keywords of the query in the form <index of query keyword>:<tf-idf>
        let i = 0;
        for (let keyword of all_keywords){
            // console.log(`i = ${i} and ${keyword}`);
            for (let word of unique_words){
                if (keyword === word) {
                    query_keyword[word] = i;
                    tf_query_words[query_keyword[word]] = 1;//initialize the elements that are present with 1| we will subtract 1 later
                }
            }
            i++;
        }
        // console.log(tf_query_words);

        // "tf" = 1,2,1...
        for (const word of query_words){
            if (tf_query_words[query_keyword[word]])//all words in query words may not be present in tf_query_words as we have removed stop words in the database but not in the user query and also the user can input anything
                tf_query_words[query_keyword[word]]++;
        }

        for (const index in tf_query_words){//subtract 1 to cancel the effect
            tf_query_words[index]--;
        }

        // console.log(tf_query_words);

        // tf =1/n,2/n,1/n...
        for (const index in tf_query_words){
            tf_query_words[index] = tf_query_words[index]/num_of_words;
        }

        // console.log(tf_query_words);

        // tfidf = 0.123,0.325,1.4...
        for (const index in tf_query_words){
            tf_query_words[index] = tf_query_words[index]*idf_vec[index];
        }

        // console.log(tf_query_words);

        let mod_square = 0;
        for (const index in tf_query_words){
           mod_square += Math.pow(tf_query_words[index], 2);
        }
        let mod = Math.sqrt(mod_square);

        let similarity = new Array(3534).fill(0);

        // console.log(similarity[3]);

        // Create an object tf_idf to store the tf-idf value in the form tf_idf[<ith doc>][<ith keyword>]=<tf-idf>

        // for (let i = 0; i < 3534; i++) {//loop to iterate over all the 3534 documents
            
        // }

        //
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

        

        // let max_similarity = Math.max(...similarity);
        // // console.log(max_similarity);
        // let idx_max = similarity.indexOf(max_similarity);
        // // console.log(idx_max);
        // const max_title = all_titles[idx_max];
        // // console.log(max_title);
        // const max_url = all_urls[idx_max];
        // console.log(max_url);

        

        for (let i = 0; i < 5; i++) {
            let max_similarity = Math.max(...similarity);
            // console.log(max_similarity);
            let idx_max = similarity.indexOf(max_similarity);
            // console.log(idx_max);
            result_idx[i] = idx_max;
            similarity[idx_max] = -1;
        }





        // let q_body =
        // {
        //     1:"",
        //     2:"",
        //     3:"",
        //     4:"",
        //     5:"",
        // }

        // for (let i = 0; i < 5; i++) {
        //     let question = await content(`./text/text${result_idx[i]}.txt`);
        //     q_body[i] = question;
        // }


        
        
        arr =
        [
            {
                // title: "A",
                // url: "www.bc.com",
                // text: "abde",
                title: all_titles[result_idx[0]],
                url: all_urls[result_idx[0]],
                text: q_body[result_idx[0]],
                // title: max_title,
                // url: max_url,
                // text: "anska",
            },
            {
                title: all_titles[result_idx[1]],
                url: all_urls[result_idx[1]],
                text: q_body[result_idx[1]],
                // title: "A",
                // url: "www.bc.com",
                // text: "abde",
            },
            {
                title: all_titles[result_idx[2]],
                url: all_urls[result_idx[2]],
                text: q_body[result_idx[2]],
                // title: "BC",
                // url: "www.ac.com",
                // text: "abef",
            },
            {
                title: all_titles[result_idx[3]],
                url: all_urls[result_idx[3]],
                text: q_body[result_idx[3]],
                // title: "BCdef",
                // url: "www.acdsdsdsd.com",
                // text: "abdsdef",
            },
            {
                title: all_titles[result_idx[4]],
                url: all_urls[result_idx[4]],
                text: q_body[result_idx[4]],
                // title: "kkmksmd",
                // url: "www.dsdfdfac.com",
                // text: "adsdbef",
            },
            q,
            flag,
        ]
        

        // return arr;
}
    
    
    

    // let query_tf = {}; //object to store the correspong tf values of the query words
    // for (let i = 0; i < num_of_words; i++) {
    //     if (query_tf[query_keyword[query_words[i]]]>0) {
    //         query_tf[query_keyword[query_words[i]]]++;
    //     }
    //     else{
    //         query_tf[query_keyword[query_words[i]]] = 1;
    //     }
    // }

    // let q_TFIDF = new Array(num_of_keywords).fill(0); // query TFIDF vector
    // for (const keyword in query_keyword) {
    //     q_TFIDF[query_keyword[keyword]] = query_tf[query_keyword[keyword]];
    // }

    // for (let i = 0; i < 3534; i++) {
        
        
    // }
    //actual result goes below in the arr
    
    search_q();
    if (result_idx[0]==-1) {
        arr.flag = 0;
    }
    else {
        arr.flag = 1;
    }
    // console.log(arr.flag);
    // console.log(result_idx[4]);
    res.json(arr);
})

app.listen(PORT, ()=>{
    console.log("Server is running on port "+PORT);
})
