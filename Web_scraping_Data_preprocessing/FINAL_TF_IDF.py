import math

import numpy as np
import pandas as pd
import re
from nltk.corpus import stopwords

all_words = set()  # set to store all unique words across all documents
num_of_documents = 3534  # number of documents = 3534
for i in range(num_of_documents):
    idx = str(i)
    with open(r"D:\AZ Hackathon\myWork\Database Final\text\text" + idx + ".txt", "r", encoding='utf-8') as f:  # to read all text files
        text = f.read()
        text = re.sub(r'[^\w\s]', '', text)
        for word in text.split():
            # word = word.translate(str.maketrans('', '', string.punctuation))
            word = word.lower()  # convert all words to lowercase to avoid duplicates
            if not word in stopwords.words("english"):
                all_words.add(word)

all_words = sorted(all_words)

dat_init = np.zeros((len(all_words), num_of_documents))
corpus_table = pd.DataFrame(index=all_words, data=dat_init)  # the final table initialized with all zeros

for i in range(num_of_documents):
    idx = str(i)
    with open(r"D:\AZ Hackathon\myWork\Database Final\text\text" + idx + ".txt", "r", encoding='utf-8') as f:
        text = f.read()
        text = re.sub(r'[^\w\s]', '', text)
        for word in text.split():
            word = word.lower()  # convert all words to lowercase to avoid duplicates
            # word = word.translate(str.maketrans('', '', string.punctuation))
            if not word in stopwords.words("english"):
                corpus_table[i][word] += 1

# print(corpus_table)

for i in range(num_of_documents):
    num_of_words = sum(corpus_table[i])
    corpus_table[i] = corpus_table[i]/num_of_words


corpus_table["idf"] = 0
# doc_freq = []

for word in all_words:
    for i in range(num_of_documents):
        if corpus_table.loc[word, i] > 0:
            corpus_table.loc[word, 'idf'] += 1
        # corpus_table.loc[word, i] = corpus_table.loc[word, i] + 1
        # print("Huh!")

corpus_table['idf'] = num_of_documents/(corpus_table['idf'])  #  num_of_documents/(corpus_table['idf'] + 1) according to the internet
corpus_table['idf'] = np.log10(corpus_table['idf'])

for i in range(num_of_documents):
    corpus_table[i] = corpus_table[i]*corpus_table['idf']


# with open("TFIDF.txt", "a") as f:
#     for i in range(num_of_documents):
#         j = 0
#         for word in all_words:
#             if corpus_table[i][word] != 0:
#                 f.write("{} {} {}\n".format(i, j, corpus_table[i][word]))
#             j += 1
#
# print(corpus_table.index)
#
# with open("keywords.txt", "a", encoding="utf-8") as f:
#     for word in all_words:
#         f.write("{} ".format(word))
#
# with open("IDF.txt", "a") as f:
#     for word in all_words:
#         f.write("{} ".format(corpus_table['idf'][word]))

with open("magnitude.txt", "a") as f:
    for i in range(num_of_documents):
        corpus_table[i] = corpus_table[i]**2
        val = sum(corpus_table[i])
        val = math.sqrt(val)
        f.write("{} ".format(val))



# ***********************************************************************END OF CORPUS_TABLE CONSTRUCTION***********************************************************************
# improvements:
# removed punctuation (else tree and tree. would be treated as different)
# lowercase
# removed stopwords

# Each column in the table represents a vector corresponding to the respective document (the ith vector correspond to the document of the question i) obtained by multiplying the TF of each word in the document with the IDF of the word
# Create a tf idf vector for the query and compare similarity through dot product



# print(corpus_table.loc("IDF"))
# print(len(corpus_table[corpus_table['idf'] == 2/3]))
# print(corpus_table['idf'].unique())
# print(len(all_words))
