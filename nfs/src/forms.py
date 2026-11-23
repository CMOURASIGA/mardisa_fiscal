from django import forms

class FileNameForm(forms.Form):
    file_name = forms.CharField(label="Enter file name", max_length=100)