# RPO-Course-Study-Material
RSH300 RPO Course Study Material

This web app is used as a study guide for the RSH300 RPO Course, a prerequisite course
for the RPO certification examination.

The quizzes will cover the General Paper and specific categories, Category 2 and 3 based on the course slides and official JTA LemTek documents.

This web app will only serve as a guide and a supplementary resource for studying for the exam.
*_Do not treat at as a source of truth_*

Some of the materials from Atom Malaysia will be referenced in this website as well.

# How to contribute
Generate a `quiz_data.json` based on the structure below:
```
[
    {
        "question": "question',
        "options": ["option 1",
                    "option 2",
                    "option 3",
                    "option 4"],
        "answer": "answer matches one of the strings in options array"
    }
]
```

Open a PR with the json and specify which section the quiz will be placed in.

# Disclaimer
All of the questions are generated using Google Gemini based on the course slides and official Jabatan Atom Malaysia document.

Feel free to open issues or PRs to address any discrepancies or wrong information in the quiz.