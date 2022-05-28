# Search-Engine-DSA-Problems
A search engine for DSA Problems

## Steps to build the code locally:
1. Run the "get_urls_and_titles.py" file in the "Web_scraping_Data_preprocessing" folder in the main branch to generate the "urls.txt" and "titles.txt" files which store the urls and titles (separated by "\n" characters) of all the questions respectively. (It may take a long time to generate all the files.)
2. Run the "get_text.py" file in the "Web_scraping_Data_preprocessing" folder in the main branch to generate all the texti.txt files (for i = 0 to i = 3534). Take care to replace the read/write paths appropriately according to your PC. (It may take a long time to generate all the files.)
3. Run the "FINAL_TF_IDF.py" in the "Web_scraping_Data_preprocessing" folder in the main branch to generate the "TFIDF.txt", "IDF.txt", "keywords.txt" and "magnitude.txt". Again, take care to replace the read/write paths appropriately according to your PC. (It may take a long time to generate all the files.)
4. Now, copy the rest of the contents of the main branch into your working directory and the files we generated as follows:
  4.1. "urls.txt", "titles.txt", "TFIDF.txt", "IDF.txt", "keywords.txt" and "magnitude.txt" go to the root folder.
  4.2. All the texti.txt (for i = 0 to i = 3534) files go to a folder "./text"
5. Now start terminal at your root folder and run the command "node server.js" (or "nodemon server.js" if you have nodemon installed).
## Link to the deployed website:
https://algoogle.herokuapp.com/
