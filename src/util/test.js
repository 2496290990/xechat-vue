const markdown = '![alt text](https://example.com/image.png "title")';
const regex = /!\[[^\]]*\]\((?<url>.*?)\)/g;
const match = regex.exec(markdown);

if (match) {
  const imageUrl = match.groups.url;
  console.log(imageUrl);
}