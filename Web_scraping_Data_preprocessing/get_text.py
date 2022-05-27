import time
from selenium import webdriver
from bs4 import BeautifulSoup
from webdriver_manager.chrome import ChromeDriverManager
driver = webdriver.Chrome(ChromeDriverManager().install())

with open("urls.txt", "r") as f:
    all_urls = f.read()
    urls = all_urls.split()

k = 0

for question in urls:
    driver.get(question)
    time.sleep(8)
    html = driver.page_source
    q_soup = BeautifulSoup(html, 'html.parser')

    q_text = q_soup.find("div", {"id": "problem-statement"})

    second_X = q_soup.select(selector="math")

    for ele in second_X:
        ele.decompose()

    final_text = q_text.getText().split("Constraints")  # to remove contents after the "Constraints" Section of CodeChef

    with open("text"+str(k)+".txt", "w+", encoding="utf-8") as f:
        f.write(final_text[0])
        f.close()
    k += 1
    # if k >= 2:
    #     break
