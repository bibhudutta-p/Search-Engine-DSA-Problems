import time
from selenium import webdriver
from bs4 import BeautifulSoup
from webdriver_manager.chrome import ChromeDriverManager
driver = webdriver.Chrome(ChromeDriverManager().install())

# https://www.codechef.com/practice?page=1&limit=20&sort_by=difficulty_rating&sort_order=asc&search=&start_rating=0&end_rating=5000&topic=&tags=&group=all

whole_site_temp1 = "https://www.codechef.com/practice?page="
whole_site_temp2 = "&limit=20&sort_by=difficulty_rating&sort_order=asc&search=&start_rating=0&end_rating=5000&topic=&tags=&group=all"
all_pages = []
# total number of pages = 176
for i in range(176):
    all_pages.append(whole_site_temp1+str(i)+whole_site_temp2)

all_questions = []
all_titles = []
for page in all_pages:
    driver.get(page)
    time.sleep(6)
    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')
    question_set = soup.findAll("a", {"class": "PracticePage_m-link__xLfvv"})
    for q in question_set:
        all_questions.append(q['href'])
        all_titles.append(q.getText())

with open("urls.txt", "w+") as f:
    for item in all_questions:
        f.write(item+"\n")
with open("titles.txt", "w+") as f:
    for item in all_titles:
        f.write(item+"\n")



# # all_questions = ["https://www.codechef.com/submit-v2/ESUBXOR"]
#
# k = 0
#
# for question in all_questions:
#     driver.get(question)
#     time.sleep(5)
#     html = driver.page_source
#     q_soup = BeautifulSoup(html, 'html.parser')
#
#     q_text = q_soup.find("div", {"id": "problem-statement"})
#
#     # for i in range(len(q_text.findAll("span", {"class": "mi"}))):
#     #     x = q_text.find("span", {"class": "mi"})
#     #     print(x.get_text())
#     #     new_tag = q_soup.new_tag("b")
#     #     new_tag.string = str(x.get_text())
#     #     print(new_tag.string)
#     #     x.replace_with(new_tag)
#     #
#     # for ele in q_text.findAll("span", {"class": "mi"}):
#     #     new_tag = q_soup.new_tag("b")
#     #     new_tag.string = ele.get_text()
#     #     ele.replace_with(new_tag)
#
#     second_X = q_soup.select(selector="math")
#
#     for ele in second_X:
#         ele.decompose()
#
#     final_text = q_text.getText().split("Constraints")
#
#     with open("text"+str(k)+".txt", "w+", encoding="utf-8") as f:
#         f.write(final_text[0])
#         f.close()
#     k += 1
#     # if k >= 2:
#     #     break