import React from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { Main as MainLayout } from 'components/layouts/main'
import { Category } from 'types/category'
import { NavigationProvider } from 'context/navigation'
import { SEO } from 'components/SEO'
import { DEFAULT_REVALIDATE_PERIOD } from 'utils/constants'
import styles from 'pages/pages.module.scss'
import { MarkdownContentService } from 'services/content'
import { GetTrack, GetTracks } from 'services/learn/filesystem'
import { Lesson, Track } from 'types/learn'
import { Container } from 'components/learn/container'

interface Props {
  categories: Array<Category>
  track: Track
  lesson: Lesson
}

export default function Index(props: Props) {
  return (
    <NavigationProvider categories={props.categories}>
      <SEO title={props.track.name} divider="🧠" description={props.track.description} />

      <MainLayout className={styles.container} title={props.track.name}>
        <h3>{props.lesson.name}</h3>

        <Container track={props.track} />
      </MainLayout>
    </NavigationProvider>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const tracks = GetTracks()

  const lessons = tracks
    .map((i) => {
      return i.lessons.map((x) => {
        return {
          track: i.id,
          lesson: x.id,
        }
      })
    })
    .flat()

  return {
    paths: lessons.map((i) => {
      return { params: i }
    }),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const service = new MarkdownContentService()
  const categories = await service.GetCategories()
  const track = GetTrack((context.params?.track as string) ?? '')
  const lesson = track?.lessons.find((i) => i.id === context.params?.lesson)

  if (!track || !lesson) {
    return {
      props: null,
      notFound: true,
    }
  }

  return {
    props: {
      categories,
      track,
      lesson,
    },
    revalidate: DEFAULT_REVALIDATE_PERIOD,
  }
}