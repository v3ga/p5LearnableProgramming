FROM ruby:3.3-slim

RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*
RUN gem install jekyll bundler

WORKDIR /srv/jekyll
COPY Gemfile ./
RUN bundle install

EXPOSE 4000
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--livereload"]
