--
-- PostgreSQL database dump
--

\restrict 6Lsf4TExf1e3TuIJbYxYB0gFz1SNXVPe18x3tiJtIjFaiQBPLNGOdApeYrxQvV5

-- Dumped from database version 17.8 (a48d9ca)
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ArticleStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ArticleStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'PUBLISHED',
    'REJECTED',
    'ARCHIVED'
);


ALTER TYPE public."ArticleStatus" OWNER TO neondb_owner;

--
-- Name: CommentStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."CommentStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."CommentStatus" OWNER TO neondb_owner;

--
-- Name: ContentStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ContentStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'ARCHIVED'
);


ALTER TYPE public."ContentStatus" OWNER TO neondb_owner;

--
-- Name: ContentType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ContentType" AS ENUM (
    'QUESTION',
    'STORY',
    'BOTH'
);


ALTER TYPE public."ContentType" OWNER TO neondb_owner;

--
-- Name: DirectoryType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."DirectoryType" AS ENUM (
    'NGO',
    'COUNSELOR',
    'HELPLINE',
    'SUPPORT_GROUP',
    'HOSPITAL',
    'CLINIC',
    'THERAPIST',
    'PSYCHIATRIST',
    'COMMUNITY_CENTER',
    'ONLINE_SERVICE'
);


ALTER TYPE public."DirectoryType" OWNER TO neondb_owner;

--
-- Name: ModerableContent; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ModerableContent" AS ENUM (
    'QUESTION',
    'STORY',
    'COMMENT'
);


ALTER TYPE public."ModerableContent" OWNER TO neondb_owner;

--
-- Name: ModerationAction; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ModerationAction" AS ENUM (
    'APPROVE',
    'REJECT',
    'ARCHIVE',
    'RESTORE',
    'EDIT',
    'PIN',
    'UNPIN',
    'FEATURE',
    'UNFEATURE'
);


ALTER TYPE public."ModerationAction" OWNER TO neondb_owner;

--
-- Name: ReportStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ReportStatus" AS ENUM (
    'PENDING',
    'UNDER_REVIEW',
    'RESOLVED',
    'DISMISSED'
);


ALTER TYPE public."ReportStatus" OWNER TO neondb_owner;

--
-- Name: ReportableContent; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ReportableContent" AS ENUM (
    'QUESTION',
    'STORY',
    'ANSWER',
    'COMMENT'
);


ALTER TYPE public."ReportableContent" OWNER TO neondb_owner;

--
-- Name: TrackedPersonType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TrackedPersonType" AS ENUM (
    'SELF',
    'CHILD'
);


ALTER TYPE public."TrackedPersonType" OWNER TO neondb_owner;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."UserRole" AS ENUM (
    'USER',
    'CONTENT_WRITER',
    'CONTENT_LEAD',
    'SUPER_ADMIN',
    'MODERATOR'
);


ALTER TYPE public."UserRole" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Name: articles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.articles (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    excerpt text,
    "coverImage" text,
    "videoUrl" text,
    status public."ArticleStatus" DEFAULT 'DRAFT'::public."ArticleStatus" NOT NULL,
    category text,
    tags text[],
    "readTime" integer,
    slug text,
    "authorId" text NOT NULL,
    "reviewerId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "reviewFeedback" text
);


ALTER TABLE public.articles OWNER TO neondb_owner;

--
-- Name: child_activity_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.child_activity_logs (
    id text NOT NULL,
    "childId" text NOT NULL,
    "activityType" text NOT NULL,
    "activityName" text NOT NULL,
    zone text NOT NULL,
    "stickerEarned" text,
    "durationSeconds" integer,
    "completedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.child_activity_logs OWNER TO neondb_owner;

--
-- Name: child_buddy_chats; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.child_buddy_chats (
    id text NOT NULL,
    "childId" text NOT NULL,
    "sessionId" text,
    "userMessage" text NOT NULL,
    "buddyResponse" text NOT NULL,
    sentiment text,
    "isFlagged" boolean DEFAULT false NOT NULL,
    "flagReason" text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.child_buddy_chats OWNER TO neondb_owner;

--
-- Name: child_mood_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.child_mood_logs (
    id text NOT NULL,
    "childId" text NOT NULL,
    mood text NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.child_mood_logs OWNER TO neondb_owner;

--
-- Name: child_progress; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.child_progress (
    id text NOT NULL,
    "childId" text NOT NULL,
    stickers text[] DEFAULT ARRAY[]::text[],
    streak integer DEFAULT 0 NOT NULL,
    "lastActiveDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.child_progress OWNER TO neondb_owner;

--
-- Name: child_worries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.child_worries (
    id text NOT NULL,
    "childId" text NOT NULL,
    "encryptedContent" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.child_worries OWNER TO neondb_owner;

--
-- Name: children; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.children (
    id text NOT NULL,
    name text NOT NULL,
    age integer NOT NULL,
    "avatarEmoji" text DEFAULT '😊'::text NOT NULL,
    "parentId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.children OWNER TO neondb_owner;

--
-- Name: directories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.directories (
    id text NOT NULL,
    name text NOT NULL,
    type public."DirectoryType" NOT NULL,
    description text NOT NULL,
    excerpt text,
    phone text,
    email text,
    website text,
    address text,
    city text,
    county text,
    region text,
    coordinates text,
    "operatingHours" text,
    languages text[],
    specializations text[],
    "isVerified" boolean DEFAULT false NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    slug text NOT NULL,
    tags text[],
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    latitude double precision,
    longitude double precision
);


ALTER TABLE public.directories OWNER TO neondb_owner;

--
-- Name: growtrack_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.growtrack_entries (
    id text NOT NULL,
    "userId" text NOT NULL,
    mood text NOT NULL,
    "moodIntensity" integer NOT NULL,
    triggers text[] DEFAULT ARRAY[]::text[],
    notes text,
    "recordedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    behaviors text[] DEFAULT ARRAY[]::text[],
    "trackedPersonName" text,
    "trackedPersonType" public."TrackedPersonType" DEFAULT 'SELF'::public."TrackedPersonType" NOT NULL
);


ALTER TABLE public.growtrack_entries OWNER TO neondb_owner;

--
-- Name: kids_corner; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.kids_corner (
    id text NOT NULL,
    "userId" text NOT NULL,
    stickers text[] DEFAULT ARRAY[]::text[],
    streak integer DEFAULT 0 NOT NULL,
    worries text[] DEFAULT ARRAY[]::text[],
    "lastMood" text,
    "lastMoodDate" timestamp(3) without time zone,
    "completedActivities" text[] DEFAULT ARRAY[]::text[],
    "lastActiveDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.kids_corner OWNER TO neondb_owner;

--
-- Name: parentcircle_analytics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.parentcircle_analytics (
    id integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "questionsSubmitted" integer DEFAULT 0 NOT NULL,
    "storiesSubmitted" integer DEFAULT 0 NOT NULL,
    "questionsApproved" integer DEFAULT 0 NOT NULL,
    "storiesApproved" integer DEFAULT 0 NOT NULL,
    "questionsRejected" integer DEFAULT 0 NOT NULL,
    "storiesRejected" integer DEFAULT 0 NOT NULL,
    "answersPosted" integer DEFAULT 0 NOT NULL,
    "uniqueContributors" integer DEFAULT 0 NOT NULL,
    "anonymousRatio" double precision,
    "totalViews" integer DEFAULT 0 NOT NULL,
    "totalVotes" integer DEFAULT 0 NOT NULL,
    "avgModerationTime" double precision,
    "topCategories" jsonb NOT NULL,
    "popularTags" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "commentsApproved" integer DEFAULT 0 NOT NULL,
    "commentsRejected" integer DEFAULT 0 NOT NULL,
    "commentsSubmitted" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.parentcircle_analytics OWNER TO neondb_owner;

--
-- Name: parentcircle_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.parentcircle_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parentcircle_analytics_id_seq OWNER TO neondb_owner;

--
-- Name: parentcircle_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.parentcircle_analytics_id_seq OWNED BY public.parentcircle_analytics.id;


--
-- Name: parentcircle_answers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.parentcircle_answers (
    id integer NOT NULL,
    content text NOT NULL,
    "questionId" integer NOT NULL,
    "createdBy" text NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "isAccepted" boolean DEFAULT false NOT NULL,
    "helpfulCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.parentcircle_answers OWNER TO neondb_owner;

--
-- Name: parentcircle_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.parentcircle_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parentcircle_answers_id_seq OWNER TO neondb_owner;

--
-- Name: parentcircle_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.parentcircle_answers_id_seq OWNED BY public.parentcircle_answers.id;


--
-- Name: parentcircle_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.parentcircle_categories (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    type public."ContentType" NOT NULL,
    icon text,
    color text,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.parentcircle_categories OWNER TO neondb_owner;

--
-- Name: parentcircle_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.parentcircle_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parentcircle_categories_id_seq OWNER TO neondb_owner;

--
-- Name: parentcircle_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.parentcircle_categories_id_seq OWNED BY public.parentcircle_categories.id;


--
-- Name: parentcircle_moderation_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.parentcircle_moderation_logs (
    id integer NOT NULL,
    "contentType" public."ModerableContent" NOT NULL,
    "contentId" integer NOT NULL,
    "questionId" integer,
    "storyId" integer,
    action public."ModerationAction" NOT NULL,
    "previousStatus" public."ContentStatus",
    "newStatus" public."ContentStatus" NOT NULL,
    "moderatorId" text NOT NULL,
    reason text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.parentcircle_moderation_logs OWNER TO neondb_owner;

--
-- Name: parentcircle_moderation_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.parentcircle_moderation_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parentcircle_moderation_logs_id_seq OWNER TO neondb_owner;

--
-- Name: parentcircle_moderation_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.parentcircle_moderation_logs_id_seq OWNED BY public.parentcircle_moderation_logs.id;


--
-- Name: parentcircle_question_votes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.parentcircle_question_votes (
    id integer NOT NULL,
    "questionId" integer NOT NULL,
    "userId" text NOT NULL,
    "isHelpful" boolean NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.parentcircle_question_votes OWNER TO neondb_owner;

--
-- Name: parentcircle_question_votes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.parentcircle_question_votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parentcircle_question_votes_id_seq OWNER TO neondb_owner;

--
-- Name: parentcircle_question_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.parentcircle_question_votes_id_seq OWNED BY public.parentcircle_question_votes.id;


--
-- Name: parentcircle_questions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.parentcircle_questions (
    id integer NOT NULL,
    title text,
    content text NOT NULL,
    slug text,
    "categoryId" integer NOT NULL,
    "createdBy" text,
    "authorName" text,
    status public."ContentStatus" DEFAULT 'PENDING'::public."ContentStatus" NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    "helpfulCount" integer DEFAULT 0 NOT NULL,
    "isPinned" boolean DEFAULT false NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    tags text[] DEFAULT ARRAY[]::text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone
);


ALTER TABLE public.parentcircle_questions OWNER TO neondb_owner;

--
-- Name: parentcircle_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.parentcircle_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parentcircle_questions_id_seq OWNER TO neondb_owner;

--
-- Name: parentcircle_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.parentcircle_questions_id_seq OWNED BY public.parentcircle_questions.id;


--
-- Name: parentcircle_reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.parentcircle_reports (
    id integer NOT NULL,
    "contentType" public."ReportableContent" NOT NULL,
    "contentId" integer NOT NULL,
    "questionId" integer,
    "storyId" integer,
    reason text NOT NULL,
    details text,
    "reportedBy" text NOT NULL,
    "reportedUserId" text,
    status public."ReportStatus" DEFAULT 'PENDING'::public."ReportStatus" NOT NULL,
    resolution text,
    "resolvedBy" text,
    "resolvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.parentcircle_reports OWNER TO neondb_owner;

--
-- Name: parentcircle_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.parentcircle_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parentcircle_reports_id_seq OWNER TO neondb_owner;

--
-- Name: parentcircle_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.parentcircle_reports_id_seq OWNED BY public.parentcircle_reports.id;


--
-- Name: parentcircle_stories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.parentcircle_stories (
    id integer NOT NULL,
    title text,
    content text NOT NULL,
    slug text,
    "categoryId" integer,
    "createdBy" text,
    "authorName" text,
    status public."ContentStatus" DEFAULT 'PENDING'::public."ContentStatus" NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    "likesCount" integer DEFAULT 0 NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    tags text[] DEFAULT ARRAY[]::text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone
);


ALTER TABLE public.parentcircle_stories OWNER TO neondb_owner;

--
-- Name: parentcircle_stories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.parentcircle_stories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parentcircle_stories_id_seq OWNER TO neondb_owner;

--
-- Name: parentcircle_stories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.parentcircle_stories_id_seq OWNED BY public.parentcircle_stories.id;


--
-- Name: parentcircle_story_votes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.parentcircle_story_votes (
    id integer NOT NULL,
    "storyId" integer NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.parentcircle_story_votes OWNER TO neondb_owner;

--
-- Name: parentcircle_story_votes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.parentcircle_story_votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parentcircle_story_votes_id_seq OWNER TO neondb_owner;

--
-- Name: parentcircle_story_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.parentcircle_story_votes_id_seq OWNED BY public.parentcircle_story_votes.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO neondb_owner;

--
-- Name: story_comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.story_comments (
    id integer NOT NULL,
    content text NOT NULL,
    "storyId" integer NOT NULL,
    "createdBy" text,
    "authorName" text,
    status public."CommentStatus" DEFAULT 'PENDING'::public."CommentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.story_comments OWNER TO neondb_owner;

--
-- Name: story_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.story_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.story_comments_id_seq OWNER TO neondb_owner;

--
-- Name: story_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.story_comments_id_seq OWNED BY public.story_comments.id;


--
-- Name: talkeasy_analytics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.talkeasy_analytics (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "totalMessages" integer DEFAULT 0 NOT NULL,
    "uniqueUsers" integer DEFAULT 0 NOT NULL,
    "crisisCount" integer DEFAULT 0 NOT NULL,
    "positiveCount" integer DEFAULT 0 NOT NULL,
    "negativeCount" integer DEFAULT 0 NOT NULL,
    "neutralCount" integer DEFAULT 0 NOT NULL,
    "categoryBreakdown" jsonb NOT NULL,
    "topicTrends" jsonb NOT NULL,
    "articlesRecommended" integer DEFAULT 0 NOT NULL,
    "directoriesRecommended" integer DEFAULT 0 NOT NULL,
    "avgProcessingTime" double precision,
    "avgMessageLength" double precision,
    "avgResponseLength" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.talkeasy_analytics OWNER TO neondb_owner;

--
-- Name: talkeasy_feedback; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.talkeasy_feedback (
    id text NOT NULL,
    "userId" text NOT NULL,
    "messageId" text NOT NULL,
    rating integer NOT NULL,
    helpful boolean,
    feedback text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.talkeasy_feedback OWNER TO neondb_owner;

--
-- Name: talkeasy_messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.talkeasy_messages (
    id text NOT NULL,
    "userId" text NOT NULL,
    message text NOT NULL,
    response text NOT NULL,
    sentiment text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sessionId" text,
    "conversationTurn" integer,
    "detectedKeywords" text[] DEFAULT ARRAY[]::text[],
    "detectedTopics" text[] DEFAULT ARRAY[]::text[],
    "emotionalIntensity" text,
    "messageLength" integer,
    "modelVersion" text,
    "primaryCategory" text,
    "processingTimeMs" integer,
    "promptVersion" text DEFAULT '1.0'::text NOT NULL,
    "recommendedArticles" text[] DEFAULT ARRAY[]::text[],
    "recommendedDirectories" text[] DEFAULT ARRAY[]::text[],
    "resourcesRequested" boolean DEFAULT false NOT NULL,
    "responseLength" integer,
    "secondaryCategory" text
);


ALTER TABLE public.talkeasy_messages OWNER TO neondb_owner;

--
-- Name: talkeasy_training_data; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.talkeasy_training_data (
    id text NOT NULL,
    "anonymizedMessage" text NOT NULL,
    "anonymizedResponse" text NOT NULL,
    sentiment text NOT NULL,
    "primaryCategory" text NOT NULL,
    "emotionalIntensity" text NOT NULL,
    topics text[] DEFAULT ARRAY[]::text[],
    keywords text[] DEFAULT ARRAY[]::text[],
    "qualityScore" double precision,
    "humanReviewed" boolean DEFAULT false NOT NULL,
    "includeInTraining" boolean DEFAULT true NOT NULL,
    "originalTimestamp" timestamp(3) without time zone NOT NULL,
    "conversationTurn" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.talkeasy_training_data OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    age integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    gender text NOT NULL,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: parentcircle_analytics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_analytics ALTER COLUMN id SET DEFAULT nextval('public.parentcircle_analytics_id_seq'::regclass);


--
-- Name: parentcircle_answers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_answers ALTER COLUMN id SET DEFAULT nextval('public.parentcircle_answers_id_seq'::regclass);


--
-- Name: parentcircle_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_categories ALTER COLUMN id SET DEFAULT nextval('public.parentcircle_categories_id_seq'::regclass);


--
-- Name: parentcircle_moderation_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_moderation_logs ALTER COLUMN id SET DEFAULT nextval('public.parentcircle_moderation_logs_id_seq'::regclass);


--
-- Name: parentcircle_question_votes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_question_votes ALTER COLUMN id SET DEFAULT nextval('public.parentcircle_question_votes_id_seq'::regclass);


--
-- Name: parentcircle_questions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_questions ALTER COLUMN id SET DEFAULT nextval('public.parentcircle_questions_id_seq'::regclass);


--
-- Name: parentcircle_reports id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_reports ALTER COLUMN id SET DEFAULT nextval('public.parentcircle_reports_id_seq'::regclass);


--
-- Name: parentcircle_stories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_stories ALTER COLUMN id SET DEFAULT nextval('public.parentcircle_stories_id_seq'::regclass);


--
-- Name: parentcircle_story_votes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_story_votes ALTER COLUMN id SET DEFAULT nextval('public.parentcircle_story_votes_id_seq'::regclass);


--
-- Name: story_comments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.story_comments ALTER COLUMN id SET DEFAULT nextval('public.story_comments_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a44ba43f-e0e4-4d1d-9c15-ffba252c4d41	81ae4917dc08ad0986782d0190cca8e417266530f0a3b55f4a16cbbce6c6177f	2025-11-09 17:43:03.168037+00	20250930101029_init		\N	2025-11-09 17:43:03.168037+00	0
b1989718-727a-4308-a467-087de52e46a6	e9aabf7131eeaf6c20c52548ed042d1237fadbcecb91844e7ec6a666181a9bec	2025-11-09 17:43:20.654415+00	20251011162239_add_articles_and_roles		\N	2025-11-09 17:43:20.654415+00	0
4d6b0c87-5479-4c3d-a6f3-94e4956c6395	665e2953acf2f9a8467a4a689c96c28fe5dc7b9a23d7d4e351672adcb82e1e3c	2025-11-09 17:43:38.276061+00	20251027134458_add_directory_model		\N	2025-11-09 17:43:38.276061+00	0
573f37ec-5cb6-4c63-83b7-2713362218b0	8f3e3cdaeca07599e253adebc6fda4a92591f2699d69ec5981b44be8fcb9bf2f	2025-11-09 17:44:50.562832+00	20251109174447_add_talkeasy_messages	\N	\N	2025-11-09 17:44:48.804881+00	1
05c00d41-8884-42ab-b4d3-a7ffca9b6e1a	cf528af71ad7cc5f0c5400db7347b501ed87a52b546866b781fee7f2e22c3ddb	2025-11-10 06:41:00.015576+00	20251110064056_add_analytics_and_recommendations	\N	\N	2025-11-10 06:40:58.480796+00	1
3d0e9967-7700-43ad-9400-05c30adc65bb	ced047ebee0936779e408e27f97448bea2b312694c5be716755e84a87bc681ea	2025-11-13 07:47:48.719151+00	20251113074745_add_review_feedback_field	\N	\N	2025-11-13 07:47:47.181138+00	1
472df34e-11c9-47c9-a14e-cb5a497a89e0	7cc272e7748ce34497f5d1af445b0cdcbe2174f5d6ea7d68683e849fe0cab7e0	2025-11-16 18:31:39.075133+00	20251116183135_add_parentcircle_feature	\N	\N	2025-11-16 18:31:37.434812+00	1
00b126e2-2079-4767-bc08-721e8934f09b	9a07c7500165f6a247eb12406c256b8d1b3a33018541a46afccc71aed5ee78a0	2025-11-16 21:16:51.017803+00	20251116211648_add_story_comments	\N	\N	2025-11-16 21:16:49.757029+00	1
a6dd2b3a-7f6e-4bba-833a-51cf75aa35e3	2f87991bea659149580f5c6daef02b007d1251bd061ea8aecccc668192852f83	2025-11-27 06:35:04.427099+00	20251127063501_add_growtrack	\N	\N	2025-11-27 06:35:03.065889+00	1
5075d761-24b8-4adb-be52-4deadde18d1e	76ffa816da4c6d5c20dfccbed2da91cd17255898d86e5cd9147a496c69beba74	2025-11-27 07:14:00.025715+00	20251127071357_update_growtrack_with_behaviors	\N	\N	2025-11-27 07:13:58.833413+00	1
15d00551-0e33-4b33-9984-f3c614221f24	23b05a222581b9e7ec4b5df0cdad82afa231ef06f2620b54a43f698056b50ba7	2025-12-05 11:23:35.288354+00	20251205112333_add_coordinates	\N	\N	2025-12-05 11:23:34.236182+00	1
83f95894-927a-4d30-92ff-f4ce2af48aa6	83bf22f5ccc232d6661bdbd4b805e1338c380df5d47ecefc8df6e70f7d4ad9e0	2026-01-02 08:38:33.281282+00	20260102083827_add_refresh_tokens	\N	\N	2026-01-02 08:38:31.196086+00	1
3515ae9a-38b5-431e-b026-e65c91d507e0	2e42e05b30b77f41ace9af71d8c8ec73c2e6e58beea5481019802e8c97e928f8	2026-02-10 10:51:58.374181+00	20260210105154_add_kidscorner_multi_child_support	\N	\N	2026-02-10 10:51:56.050312+00	1
\.


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.articles (id, title, content, excerpt, "coverImage", "videoUrl", status, category, tags, "readTime", slug, "authorId", "reviewerId", "createdAt", "updatedAt", "publishedAt", "reviewFeedback") FROM stdin;
cmh4uq4ri0001v1wkvynel419	How to Set Healthy Boundaries Without Feeling Guilty	# How to Set Healthy Boundaries Without Feeling Guilty\n\nDo you find yourself saying "yes" when you really want to say "no"? Do you feel exhausted from constantly putting others' needs before your own? If so, you're not alone. Many people struggle with setting healthy boundaries, often because they've been conditioned to believe that saying "no" makes them selfish or unkind.\n\nThe truth is, **boundaries aren't walls – they're bridges** to healthier, more authentic relationships.\n\n## What Are Healthy Boundaries?\n\nBoundaries are the limits we set to protect our physical, emotional, and mental well-being. They define what we're comfortable with and what we're not. Think of them as property lines for your personal space, time, energy, and values.\n\nHealthy boundaries include:\n- **Physical boundaries**: Your comfort with touch, personal space, and physical safety\n- **Emotional boundaries**: Protecting yourself from manipulation, guilt trips, or emotional abuse\n- **Time boundaries**: How you spend your time and with whom\n- **Digital boundaries**: Limits on technology use and online interactions\n- **Financial boundaries**: How you handle money and financial requests\n\n## Why We Struggle with Boundaries\n\n### The Guilt Factor\nMany of us were raised with messages like:\n- "Don't be selfish"\n- "Always put others first"\n- "Good people don't say no"\n- "Family comes first, no matter what"\n\nThese well-meaning but misguided teachings can create **boundary guilt** – the uncomfortable feeling that comes with protecting your own needs.\n\n### Fear of Rejection\nWe worry that setting boundaries will:\n- Make people angry with us\n- Cause others to reject or abandon us\n- Label us as "difficult" or "mean"\n- Damage our relationships\n\n**The reality**: People who truly care about you will respect your boundaries. Those who don't may not have your best interests at heart.\n\n## The Cost of Poor Boundaries\n\nWhen we consistently ignore our own limits, we experience:\n\n### Physical Symptoms\n- Chronic fatigue and burnout\n- Frequent headaches or illness\n- Sleep problems\n- Digestive issues from stress\n\n### Emotional Consequences\n- Resentment toward others\n- Loss of sense of self\n- Anxiety and depression\n- Feeling overwhelmed and out of control\n\n### Relationship Issues\n- **Codependent patterns** that aren't healthy for anyone\n- One-sided relationships where you give but don't receive\n- Loss of respect from others (ironically, the opposite of what we fear)\n\n## A Step-by-Step Guide to Setting Boundaries\n\n### Step 1: Identify Where You Need Boundaries\nAsk yourself:\n- Where in my life do I feel resentful or overwhelmed?\n- What situations make me feel uncomfortable or stressed?\n- When do I find myself saying "yes" but feeling "no"?\n- What behaviors from others drain my energy?\n\n**Example scenarios:**\n- Your boss regularly asks you to work late without notice\n- A friend constantly vents to you but never asks how you're doing\n- Family members drop by unannounced expecting your time\n- Colleagues interrupt you constantly throughout the day\n\n### Step 2: Start Small and Practice\nBegin with **low-stakes situations** to build your boundary-setting muscle:\n\n**Practice phrases:**\n- "Let me check my schedule and get back to you"\n- "I'm not available for that right now"\n- "That doesn't work for me"\n- "I need some time to think about it"\n\n### Step 3: Be Clear and Direct\n**Instead of:** "I'm sorry, I just can't... maybe if I didn't have so much going on... I feel terrible saying no..."\n\n**Try:** "I won't be able to help with that project. I hope you find someone who can."\n\n**The key**: Avoid over-explaining or apologizing excessively. You don't need to justify your boundaries.\n\n### Step 4: Expect Pushback (And Stay Strong)\nWhen you start setting boundaries, some people may:\n- Test your limits to see if you'll cave\n- Guilt trip you ("I guess I'll just figure it out myself...")\n- Get angry or give you the silent treatment\n- Try to negotiate or bargain\n\n**Remember**: Their reaction is about them, not you. Stay calm and consistent.\n\n## Boundary Scripts for Common Situations\n\n### At Work\n**Situation**: Colleague constantly interrupting you\n**Boundary**: "I'm in deep focus mode right now. Can we schedule time to talk at 3 PM?"\n\n**Situation**: Boss asking you to work weekends regularly\n**Boundary**: "I'm committed to maintaining work-life balance. I'm not available for weekend work except in genuine emergencies."\n\n### With Family\n**Situation**: Relative making inappropriate comments\n**Boundary**: "I don't want to discuss my personal life. Let's talk about something else."\n\n**Situation**: Parents expecting you to visit every weekend\n**Boundary**: "I love spending time with you, and I'll be visiting once a month instead of every weekend."\n\n### In Friendships\n**Situation**: Friend who only calls when they need something\n**Boundary**: "I've noticed our conversations are often about your problems. I'd love to have more balanced conversations about both our lives."\n\n**Situation**: Friend pressuring you to drink when you don't want to\n**Boundary**: "I'm not drinking tonight. Please don't ask again."\n\n## Overcoming Boundary Guilt\n\n### Reframe Your Thinking\n**Instead of:** "I'm being selfish"\n**Think:** "I'm taking care of myself so I can be present for what matters most"\n\n**Instead of:** "I'm disappointing them"\n**Think:** "I'm teaching people how to treat me with respect"\n\n**Instead of:** "Good people always say yes"\n**Think:** "Good people take care of themselves and others in healthy ways"\n\n### Remember Your Values\nAsk yourself:\n- What kind of life do I want to live?\n- What relationships do I want to cultivate?\n- How can I show up as my best self?\n\nBoundaries help you live in alignment with your values, not against them.\n\n### Practice Self-Compassion\n- Acknowledge that setting boundaries is difficult\n- Celebrate small wins when you successfully maintain a boundary\n- Be patient with yourself as you learn this new skill\n- Remember that you deserve respect and care – including from yourself\n\n## Advanced Boundary Strategies\n\n### The Broken Record Technique\nRepeat your boundary calmly without getting drawn into arguments:\n- "As I said, I'm not available for that."\n- "My answer remains the same."\n- "I've already given you my response."\n\n### The Boundary Sandwich\n1. **Acknowledge**: "I understand this is important to you"\n2. **Boundary**: "I won't be able to help with this"\n3. **Alternative**: "Maybe [name] would be a good person to ask"\n\n### Setting Consequences\n"If you continue to call me after 9 PM, I'll need to turn off my phone."\n"If you keep bringing up this topic, I'll need to leave the conversation."\n\n## When Professional Help is Needed\n\nConsider therapy or counseling if:\n- You have trauma history that makes boundaries feel dangerous\n- You experience severe anxiety when setting limits\n- You're in an abusive relationship where boundaries are met with violence or threats\n- You struggle with substance abuse as a way to cope with boundary violations\n\n## The Beautiful Truth About Boundaries\n\nWhen you consistently set and maintain healthy boundaries:\n\n### Your Relationships Improve\n- People know what to expect from you\n- You attract others who respect your limits\n- You can give freely without resentment\n- Your relationships become more authentic and balanced\n\n### Your Self-Respect Grows\n- You trust yourself to protect your well-being\n- You feel more confident in your decisions\n- You develop a stronger sense of self\n- You model healthy behavior for others\n\n### Your Energy Increases\n- You stop depleting yourself with obligations that don't serve you\n- You have more time and energy for what matters most\n- You feel more aligned with your values and goals\n\n## Your Boundary Action Plan\n\n### This Week:\n1. **Identify** one area where you need better boundaries\n2. **Practice** saying "no" to one small request\n3. **Notice** how it feels – both the discomfort and the relief\n\n### This Month:\n1. **Set** one significant boundary in an important relationship\n2. **Maintain** that boundary even when tested\n3. **Reflect** on how it impacts your well-being\n\n### This Year:\n1. **Develop** a consistent practice of checking in with your limits\n2. **Surround** yourself with people who respect your boundaries\n3. **Celebrate** your growth in self-advocacy and self-care\n\n## Final Thoughts\n\nSetting boundaries isn't about building walls or being unkind. It's about creating the space you need to be your best self and to show up authentically in your relationships.\n\nYou don't need permission to protect your well-being. You don't need to justify your limits. You don't need to feel guilty for taking care of yourself.\n\n**You matter. Your needs matter. Your peace of mind matters.**\n\nStart small, be consistent, and remember: every boundary you set is an act of self-love and a step toward the life you truly want to live.\n\nWhat boundary will you set today?\n\n---\n\n*Remember: If you're in an abusive relationship, please reach out to professionals who can help you safely navigate boundary-setting. The National Domestic Violence Hotline (1-800-799-7233) provides confidential support 24/7.*	Setting boundaries is essential for mental health, but many people struggle with guilt when saying no. Learn practical strategies to establish clear limits while maintaining healthy relationships and protecting your well-being.	https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80	https://www.youtube.com/watch?v=SiwrwOCRTak	PUBLISHED	Communication	{"stress relief","mental health",mindfulness,wellness,anxiety}	8	how-to-set-healthy-boundaries-without-feeling-guilty	cmh4q8ks90000v18kcrdhfbxu	cmh4q8ks90000v18kcrdhfbxu	2025-10-24 12:53:02.238	2025-10-24 15:01:54.808	2025-10-24 15:01:54.807	\N
cmh4w1kdh0001v1w0fm8y0uwg	Breaking the Cycle: 7 Science-Backed Ways to Stop Overthinking	# Breaking the Cycle: 7 Science-Backed Ways to Stop Overthinking\n\nHave you ever found yourself lying awake at 2 AM, replaying a conversation from three days ago? Or spent hours analyzing every possible outcome of a decision that should take five minutes? If so, you're not alone. **Overthinking affects 73% of adults** according to recent research, and it's one of the most common contributors to anxiety and depression.\n\nThe good news? Overthinking is a habit, not a personality trait. And like any habit, it can be changed with the right strategies.\n\n## What Exactly Is Overthinking?\n\nOverthinking, also known as **rumination** in psychology, is the tendency to repetitively focus on problems, causes, and consequences without moving toward solutions. It's like having a browser with 47 tabs open – your mental processing power gets overwhelmed, and nothing gets accomplished effectively.\n\n### The Two Types of Overthinking\n\n**1. Rumination**: Dwelling on past events\n- *"Why did I say that in the meeting?"*\n- *"I should have handled that situation differently"*\n- *"What if I had made a different choice five years ago?"*\n\n**2. Worry**: Catastrophizing about future scenarios\n- *"What if I mess up my presentation tomorrow?"*\n- *"What if my headache means something serious?"*\n- *"What if I never find the right career?"*\n\n## The Hidden Costs of Overthinking\n\nBefore we dive into solutions, it's important to understand why breaking this cycle matters for your mental health:\n\n### Physical Impact\n- **Increased cortisol levels** leading to chronic stress\n- **Sleep disruption** and insomnia\n- **Headaches and muscle tension**\n- **Weakened immune system**\n- **Digestive issues** from chronic stress\n\n### Mental and Emotional Impact\n- **Decision paralysis** – inability to make choices\n- **Reduced problem-solving ability**\n- **Increased anxiety and depression**\n- **Lower self-esteem and confidence**\n- **Relationship strain** from seeking constant reassurance\n\n### Life Impact\n- **Missed opportunities** due to indecision\n- **Procrastination** and reduced productivity\n- **Social withdrawal** to avoid triggering situations\n- **Career stagnation** from fear of making wrong moves\n\n## 7 Science-Backed Strategies to Stop Overthinking\n\n### 1. The 5-4-3-2-1 Grounding Technique\n\nWhen you notice your mind spiraling, use this sensory grounding exercise:\n\n- **5 things** you can see\n- **4 things** you can touch\n- **3 things** you can hear\n- **2 things** you can smell\n- **1 thing** you can taste\n\n**Why it works**: This technique activates your parasympathetic nervous system and pulls you out of your head into the present moment. Research shows it can reduce anxiety symptoms by up to 60% when practiced regularly.\n\n**Example**: *"I can see my coffee mug, my laptop, the tree outside my window, my pen, and my notebook. I can touch my soft sweater, the smooth desk surface, my phone, and this textured book cover..."*\n\n### 2. Set a "Worry Window"\n\nDesignate **15 minutes each day** as your official worry time.\n\n**How to do it**:\n- Choose the same time daily (not before bed)\n- When worries arise outside this window, write them down and say *"I'll think about this during my worry time"*\n- During your worry window, review your list and either take action or accept what you can't control\n\n**The science**: Studies from Penn State University show this technique reduces overall worry time by 35% and improves sleep quality in 78% of participants.\n\n### 3. The "Best Friend" Test\n\nAsk yourself: *"What would I tell my best friend if they came to me with this exact problem?"*\n\n**Why this works**: We're often much kinder and more rational when advising others. This cognitive technique, called **self-distancing**, helps you view your situation more objectively.\n\n**Research backing**: Studies show that people who use self-distancing techniques make better decisions and experience 25% less emotional distress.\n\n### 4. Challenge Your Thoughts with Questions\n\nWhen you catch yourself overthinking, ask:\n\n- **"Is this thought helpful or harmful?"**\n- **"What evidence do I have that this is true?"**\n- **"What would I need to know to resolve this?"**\n- **"Am I thinking about this to solve a problem or just to worry?"**\n- **"What's the worst realistic outcome, and how would I handle it?"**\n\n**The principle**: This is based on **Cognitive Behavioral Therapy (CBT)**, which has a 70-80% success rate in treating overthinking and anxiety disorders.\n\n### 5. Use the "Two-Minute Rule"\n\nIf you can resolve or take action on something in **two minutes or less**, do it immediately. If not, either:\n- Schedule a specific time to address it\n- Add it to your action list\n- Accept that it's out of your control\n\n**Example scenarios**:\n- *Worried about an email response?* → Send a quick follow-up\n- *Anxious about a doctor's appointment?* → Call and schedule it\n- *Concerned about a friend?* → Send a caring text message\n\n### 6. Practice "Mental Time Travel" Technique\n\nWhen overthinking about a problem, ask yourself:\n- **"Will this matter in 5 minutes?"**\n- **"Will this matter in 5 months?"**\n- **"Will this matter in 5 years?"**\n\n**The insight**: Research shows that **temporal distancing** – imagining yourself in the future – reduces the emotional intensity of current problems by up to 50%.\n\n### 7. Engage in "Cognitive Load" Activities\n\nThese activities require enough mental focus to interrupt overthinking loops:\n\n**Mental activities**:\n- Counting backward from 100 by 7s\n- Naming animals that start with each letter of the alphabet\n- Doing mental math problems\n- Learning a new language on an app\n\n**Physical activities**:\n- **Progressive muscle relaxation**\n- **Focused breathing exercises** (4-7-8 technique)\n- **Exercise** (even 10 minutes can reset your mental state)\n- **Creative activities** like drawing, music, or crafts\n\n**The neuroscience**: These activities activate different brain networks, literally interrupting the neural pathways associated with rumination.\n\n## Creating Your Personal Anti-Overthinking Toolkit\n\n### Daily Practices (5-10 minutes)\n- **Morning intention setting**: "Today I will act rather than analyze"\n- **Midday check-in**: "Am I thinking productively or just worrying?"\n- **Evening reflection**: "What did I handle well today without overthinking?"\n\n### Weekly Practices (30 minutes)\n- **Review your worry journal** – notice patterns\n- **Practice one new grounding technique**\n- **Plan specific actions** for ongoing concerns\n\n### Monthly Practices (1 hour)\n- **Assess your progress** – are you overthinking less?\n- **Adjust your strategies** based on what's working\n- **Celebrate your wins** – acknowledge when you've broken the cycle\n\n## When to Seek Professional Help\n\nConsider talking to a mental health professional if:\n- Overthinking interferes with your daily life for **more than 2 weeks**\n- You experience **physical symptoms** like panic attacks or chronic insomnia\n- You have **thoughts of self-harm** or feel hopeless\n- You're unable to make **basic decisions** due to analysis paralysis\n- Your relationships are suffering because of constant worry\n\n**Remember**: Seeking help is a sign of strength, not weakness. Therapists have specialized tools like CBT, ACT (Acceptance and Commitment Therapy), and EMDR that can be incredibly effective.\n\n## The Overthinking Recovery Timeline\n\n**Week 1-2**: Awareness building\n- Notice when you're overthinking (without judgment)\n- Start using grounding techniques\n- Implement the two-minute rule\n\n**Week 3-4**: Skill building\n- Add worry windows to your routine\n- Practice thought challenging\n- Begin cognitive load activities\n\n**Month 2-3**: Habit formation\n- Techniques become more automatic\n- You catch overthinking cycles earlier\n- Decision-making improves noticeably\n\n**Month 3+**: Sustainable change\n- Overthinking episodes become shorter and less frequent\n- Increased confidence in your ability to handle uncertainty\n- Better overall mental health and life satisfaction\n\n## Real Success Stories\n\n*"I used to spend hours deciding what to wear to work. Now I use the two-minute rule – if I can't decide quickly, I go with my first instinct. It's freed up so much mental energy for things that actually matter."* – Sarah, 29\n\n*"The worry window changed my life. Instead of worrying all day, I write things down and deal with them at 4 PM. Most of the time, by 4 PM, the problems have either resolved themselves or seem much smaller."* – Marcus, 35\n\n*"Learning to ask 'What would I tell my best friend?' was a game-changer. I realized I was being incredibly harsh with myself about things I'd never judge others for."* – Jennifer, 42\n\n## Your Action Plan for This Week\n\n### Day 1-2: Awareness\n- Simply notice when you're overthinking\n- No judgment, just awareness\n- Keep a small notepad to jot down patterns\n\n### Day 3-4: Implement One Technique\n- Choose ONE strategy from this article\n- Practice it every time you notice overthinking\n- Focus on consistency, not perfection\n\n### Day 5-7: Expand Your Toolkit\n- Add a second technique\n- Set up your worry window\n- Start challenging unhelpful thoughts\n\n## Remember: Progress, Not Perfection\n\nBreaking the overthinking cycle isn't about never having another worried thought. It's about:\n- **Recognizing** when your thinking becomes unproductive\n- **Redirecting** your mental energy toward solutions or acceptance\n- **Reducing** the time you spend in mental loops\n- **Reclaiming** your peace of mind and decision-making power\n\nOverthinking often stems from a desire to control outcomes and avoid mistakes. But here's the truth: **uncertainty is part of life, and most of our worst-case scenarios never happen**.\n\nYour mind is incredibly powerful. Instead of using that power to create endless worry loops, you can train it to be your greatest ally in creating the life you want.\n\n**What's one overthinking pattern you're ready to break today?**\n\nStart small, be patient with yourself, and remember – every time you catch yourself overthinking and redirect your attention, you're literally rewiring your brain for better mental health.\n\nThe cycle can be broken. Your peace of mind is worth the effort.\n\n---\n\n*If you're experiencing persistent anxiety or depression, please reach out to a mental health professional. The National Suicide Prevention Lifeline (988) provides free, confidential support 24/7.*	Overthinking can trap you in endless loops of worry and analysis. Discover evidence-based strategies to quiet your mind, reduce anxiety, and regain mental clarity with these proven techniques from cognitive psychology.	https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80	https://www.youtube.com/watch?v=VrSUe_m19FY	APPROVED	Mental Health	{"stress relief","mental health",self-care}	9	breaking-the-cycle-7-science-backed-ways-to-stop-overthinking	cmh4q8ks90000v18kcrdhfbxu	cmh4q8ks90000v18kcrdhfbxu	2025-10-24 13:29:55.239	2025-10-26 19:05:57.315	2025-10-24 13:31:33.537	\N
cmh4u5d9h0001v19wrkg302sj	The 5-Minute Morning Routine That Will Transform Your Mental Health	# The 5-Minute Morning Routine That Will Transform Your Mental Health\n\nHow you start your morning sets the tone for your entire day. Yet many of us rush through our mornings in a frantic state, checking phones, skipping breakfast, and diving straight into stress mode.\n\nWhat if I told you that just **5 minutes** could completely change your mental health trajectory? This evidence-based morning routine is designed to be simple, sustainable, and transformative.\n\n## Why Morning Routines Matter for Mental Health\n\nResearch shows that the first hour of your day significantly impacts your stress levels, productivity, and overall well-being. When we start our day reactively – responding to emails, news, or external demands – we activate our stress response system before we've even had a chance to center ourselves.\n\nA mindful morning routine acts as a **mental health insurance policy**, creating a buffer of calm and clarity that helps you navigate whatever the day brings.\n\n## The 5-Minute Transformation Routine\n\nThis routine requires no special equipment, can be done anywhere, and takes exactly 5 minutes. Here's the breakdown:\n\n### Minute 1: Mindful Breathing (60 seconds)\n- Sit comfortably or remain lying in bed\n- Place one hand on your chest, one on your belly\n- Take 4 slow, deep breaths using the **4-7-8 technique**:\n  - Inhale for 4 counts\n  - Hold for 7 counts  \n  - Exhale for 8 counts\n- This activates your parasympathetic nervous system and reduces cortisol\n\n### Minutes 2-3: Gratitude Practice (2 minutes)\nThink of **three specific things** you're grateful for right now. Make them detailed:\n- **One thing about yourself** ("I'm grateful for my resilience during yesterday's challenge")\n- **One thing about your relationships** ("I'm grateful for my friend's encouraging text last night")\n- **One thing about your environment** ("I'm grateful for the warm sunlight coming through my window")\n\n*Why this works:* Gratitude practice literally rewires your brain for positivity and has been shown to improve mood, sleep quality, and immune function.\n\n### Minute 4: Gentle Movement (60 seconds)\nChoose one simple movement to wake up your body:\n- **Gentle stretches** while sitting or lying down\n- **Shoulder rolls** and neck circles\n- **Seated spinal twists**\n- **Simple arm circles** above your head\n\nThe goal isn't exercise – it's reconnecting with your body and increasing blood flow to your brain.\n\n### Minute 5: Intention Setting (60 seconds)\nAsk yourself these three questions:\n1. **"How do I want to feel today?"** (calm, energized, focused, etc.)\n2. **"What's one thing I'm looking forward to?"** \n3. **"What's my priority focus for today?"**\n\nThis creates mental clarity and purpose rather than leaving your day to chance.\n\n## Making It Stick: Implementation Tips\n\n### Start Small\n- Begin with just the breathing exercise for one week\n- Add one component each week until you're doing the full routine\n- **Consistency beats perfection** – even 2-3 minutes is better than nothing\n\n### Create Environmental Cues\n- Keep a journal by your bedside for gratitude practice\n- Set out comfortable clothes the night before\n- Use a gentle alarm tone instead of jarring sounds\n\n### Track Your Progress\nNotice changes in:\n- Your energy levels throughout the day\n- How you handle stress and challenges\n- Your overall mood and outlook\n- Quality of sleep (many people report better sleep when they start the day mindfully)\n\n## The Science Behind the Magic\n\nThis routine combines several evidence-based practices:\n\n**Breathwork** activates the vagus nerve, which signals safety to your nervous system and reduces stress hormones.\n\n**Gratitude practice** increases dopamine and serotonin production while strengthening neural pathways associated with positive thinking.\n\n**Gentle movement** releases endorphins and increases BDNF (brain-derived neurotrophic factor), which supports brain health and mood regulation.\n\n**Intention setting** engages your prefrontal cortex, improving focus and decision-making throughout the day.\n\n## Real Results from Real People\n\n*"I was skeptical that 5 minutes could make a difference, but after two weeks, I noticed I was less reactive to stress and felt more grounded throughout the day."* - Sarah, 34\n\n*"This routine helped me break my habit of immediately checking my phone when I wake up. Now I start with intention instead of anxiety."* - Marcus, 28\n\n*"As someone with anxiety, this gentle start to my day has been a game-changer. I feel more equipped to handle whatever comes my way."* - Jennifer, 42\n\n## Troubleshooting Common Challenges\n\n### "I don't have time"\n- Start with just 2-3 minutes\n- Do it while still in bed\n- Remember: this routine actually **saves** time by improving your focus and decision-making\n\n### "I keep forgetting"\n- Set a phone reminder for the first week\n- Link it to an existing habit (like using the bathroom)\n- Put a sticky note where you'll see it first thing\n\n### "My mind wanders during the practice"\n- This is completely normal and part of the process\n- Gently redirect your attention back to the practice\n- Consider using a guided meditation app for the breathing portion\n\n## Advanced Variations\n\nOnce you've mastered the basic routine, you can experiment with:\n- **Journaling** your gratitude instead of just thinking it\n- **Adding affirmations** during the intention-setting minute\n- **Including gentle yoga poses** for the movement component\n- **Meditation music** to enhance the breathing practice\n\n## The Ripple Effect\n\nThe beautiful thing about this morning routine is how it ripples throughout your day. When you start with intention and calm:\n\n- You make better decisions about food, work, and relationships\n- You're more present with loved ones\n- You handle stress with greater resilience\n- You end the day feeling more accomplished and peaceful\n\n## Your Challenge\n\nTry this 5-minute routine for just **one week**. Notice what shifts in your energy, mood, and overall sense of well-being.\n\nRemember: transformation doesn't require dramatic changes. Sometimes the smallest shifts create the most profound results.\n\nYour mental health deserves those 5 minutes. Your future self will thank you.\n\n## Quick Reference Guide\n\n**Minute 1:** 4-7-8 breathing (4 cycles)\n**Minutes 2-3:** Three specific gratitudes\n**Minute 4:** Gentle movement\n**Minute 5:** Intention setting (3 questions)\n\nStart tomorrow morning. Your journey to better mental health begins with a single breath.	Start your day with intention and calm. This simple 5-minute morning routine combines mindfulness, gratitude, and gentle movement to set a positive tone for your entire day.	https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80	https://www.youtube.com/watch?v=YQcZKDSk4wM	PUBLISHED	Self-Care	{}	6	the-5-minute-morning-routine-that-will-transform-your-mental-health	cmh4q8ks90000v18kcrdhfbxu	cmh4q8ks90000v18kcrdhfbxu	2025-10-24 12:36:53.421	2025-10-24 12:38:15.375	2025-10-24 12:38:15.372	\N
cmhwbekqw0003fghoy08ovukc	What is mental health awareness	Mental health is....	Mental Health is ....	data:image/jpeg;base64,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	\N	REJECTED	Mental Health	{}	1	what-is-mental-health-awareness	cmhwbc4vi0001fgho7yobfptb	cmh4q8ks90000v18kcrdhfbxu	2025-11-12 18:09:42.491	2025-11-13 07:50:07.081	\N	It is not complete
\.


--
-- Data for Name: child_activity_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.child_activity_logs (id, "childId", "activityType", "activityName", zone, "stickerEarned", "durationSeconds", "completedAt") FROM stdin;
cmlgjwv810008blwscx91s94p	cmlgjuh5b0003blwsia0mmnm6	game	Puzzle Challenge	play	🧩	\N	2026-02-10 12:02:24.144
cmlgjxig4000ablws26v59gku	cmlgjuh5b0003blwsia0mmnm6	game	Puzzle Challenge	play	🧩	\N	2026-02-10 12:02:54.244
cmlgjxn9h000cblwsn94a3x66	cmlgjuh5b0003blwsia0mmnm6	game	Puzzle Challenge	play	🧩	\N	2026-02-10 12:03:00.484
cmlgjxqqf000eblws6acz3m4o	cmlgjuh5b0003blwsia0mmnm6	game	Puzzle Challenge	play	🧩	\N	2026-02-10 12:03:04.983
cmlgjxthf000gblws0c4kz4ln	cmlgjuh5b0003blwsia0mmnm6	game	Puzzle Challenge	play	🧩	\N	2026-02-10 12:03:08.547
cmlgk0ohq000iblwszk5fke57	cmlgjuh5b0003blwsia0mmnm6	story	The Happy Cloud	learn	\N	\N	2026-02-10 12:05:22.046
cmlgk0x44000kblws7ah4ke5n	cmlgjuh5b0003blwsia0mmnm6	story	The Angry Volcano	learn	\N	\N	2026-02-10 12:05:33.22
cmlgkgruc000tblwsh5zbxrod	cmlgk8si0000oblws7r6jbfrl	game	Creative Corner	play	🎨	\N	2026-02-10 12:17:52.884
cmlgtkf67000zblwslcv8oyag	cmlgjuh5b0003blwsia0mmnm6	game	Creative Corner	play	🎨	\N	2026-02-10 16:32:39.626
cmlgua4ye0011blwsrjp6kfgi	cmlgjuh5b0003blwsia0mmnm6	game	Creative Corner	play	🎨	\N	2026-02-10 16:52:39.442
cmmqo8wu80007blxku7olqxmb	cmlgjuh5b0003blwsia0mmnm6	story	The Angry Volcano	learn	\N	\N	2026-03-14 18:41:08.672
cmmqpy1o4000bblxkvp6vfvpw	cmlgjuh5b0003blwsia0mmnm6	game	Mindful Games	play	🌿	\N	2026-03-14 19:28:40.948
\.


--
-- Data for Name: child_buddy_chats; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.child_buddy_chats (id, "childId", "sessionId", "userMessage", "buddyResponse", sentiment, "isFlagged", "flagReason", "timestamp") FROM stdin;
cmlgk1qe9000mblwst5vrzfdv	cmlgjuh5b0003blwsia0mmnm6	8e5a1d73-3570-4dcf-8ef6-123051e78dc2	Sad	Hi there! I'm Buddy, and I'm here to listen. (AI integration coming in next step!)	neutral	f	\N	2026-02-10 12:06:11.169
\.


--
-- Data for Name: child_mood_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.child_mood_logs (id, "childId", mood, "timestamp") FROM stdin;
cmlgjv1qo0006blwsqk3dzwbu	cmlgjuh5b0003blwsia0mmnm6	calm	2026-02-10 12:00:59.28
cmlgk94kt000rblwse5p14tsw	cmlgk8si0000oblws7r6jbfrl	calm	2026-02-10 12:11:55.935
cmmqo6ya30005blxksjkzrelg	cmlgjuh5b0003blwsia0mmnm6	angry	2026-03-14 18:39:37.227
\.


--
-- Data for Name: child_progress; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.child_progress (id, "childId", stickers, streak, "lastActiveDate", "createdAt", "updatedAt") FROM stdin;
cmlgk8si0000pblwsi51l2uux	cmlgk8si0000oblws7r6jbfrl	{🎨}	1	2026-02-10 12:17:53.972	2026-02-10 12:11:40.274	2026-02-10 12:17:53.975
cmlgjuh5b0004blwsen5aq7ct	cmlgjuh5b0003blwsia0mmnm6	{🧩,🧩,🧩,🧩,🧩,🎨,🎨,🌿}	1	2026-03-14 19:28:42.08	2026-02-10 12:00:32.36	2026-03-14 19:28:42.153
\.


--
-- Data for Name: child_worries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.child_worries (id, "childId", "encryptedContent", "createdAt") FROM stdin;
\.


--
-- Data for Name: children; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.children (id, name, age, "avatarEmoji", "parentId", "isActive", "createdAt", "updatedAt") FROM stdin;
cmlgjuh5b0003blwsia0mmnm6	Davine	12	🐨	cmiroiaam0000v1bs8926cyt8	t	2026-02-10 12:00:32.36	2026-02-10 12:00:32.36
cmlgk8si0000oblws7r6jbfrl	Chebon	5	🦁	cmiroiaam0000v1bs8926cyt8	t	2026-02-10 12:11:40.274	2026-02-10 12:11:40.274
\.


--
-- Data for Name: directories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.directories (id, name, type, description, excerpt, phone, email, website, address, city, county, region, coordinates, "operatingHours", languages, specializations, "isVerified", "isFeatured", slug, tags, "createdById", "createdAt", "updatedAt", latitude, longitude) FROM stdin;
cmhd1gxby0001v1xslkmsccbt	Kenya Youth Mental Health Helpline	HELPLINE	A confidential 24/7 helpline providing emotional support, crisis intervention, and guidance to young people and their families dealing with mental health challenges. Our trained counselors offer compassionate listening and connect callers with appropriate resources and professional help when needed.	24/7 confidential support for youth mental health crises and emotional guidance.	0800567890	support@youthhelpline.co.ke	https://www.youthhelpline.co.ke	Virtual Service - No Physical Address	Nairobi	Nairobi	\N	\N	24 hours, 7 days a week	{English,Swahili,Kikuyu}	{"Crisis Intervention","Suicide Prevention","Teen Anxiety","Depression Support","Family Counseling"}	t	t	kenya-youth-mental-health-helpline	{24/7,"Free Service",Confidential,"Youth Focused","Emergency Support"}	cmh4q8ks90000v18kcrdhfbxu	2025-10-30 06:23:59.414	2025-10-30 06:23:59.414	\N	\N
cmhd1py3q0003v1xssmv05d66	Pamoja Family Wellness Center	COUNSELOR	Pamoja Family Wellness Center is a community-based counseling facility offering affordable mental health services for children, adolescents, and families. Our team of licensed counselors specializes in play therapy, trauma-informed care, and family systems therapy. We create a safe, welcoming environment where families can heal and grow together.	Affordable family counseling with specialized play therapy for children and teens.	+254 722 345 678	info@pamojawellness.co.ke	https://www.pamojawellness.co.ke	Moi Avenue, CBD Plaza, 3rd Floor	Kisumu	Kisumu	\N	\N	Monday - Friday: 8:00 AM - 6:00 PM, Saturday: 9:00 AM - 2:00 PM	{English,Swahili,Luo,Luhya}	{"Play Therapy","Child Psychology","Trauma Counseling","Family Therapy","Adolescent Issues","Grief Support"}	t	f	pamoja-family-wellness-center	{Affordable,Child-Friendly,"Licensed Counselors","Insurance Accepted","Walk-ins Welcome"}	cmh4q8ks90000v18kcrdhfbxu	2025-10-30 06:31:00.267	2025-10-30 06:31:00.267	\N	\N
\.


--
-- Data for Name: growtrack_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.growtrack_entries (id, "userId", mood, "moodIntensity", triggers, notes, "recordedAt", "createdAt", "updatedAt", behaviors, "trackedPersonName", "trackedPersonType") FROM stdin;
cmih2wdwy0002v1nw4sod306u	cmih2voqh0000v1nwq0135ike	Happy	8	{"Good sleep","Productive work day",Exercise}	Had a great day at work.  Finished my project on time and went for a run in the evening.  Feeling accomplished!	2025-11-27 06:54:45.517	2025-11-27 06:54:47.403	2025-11-27 06:54:47.403	{}	\N	SELF
cmih2wrih0004v1nwiwa5ay00	cmih2voqh0000v1nwq0135ike	Anxious	7	{"Upcoming deadline","Financial worries","Family pressure"}	Feeling stressed about the project deadline next week. Also worried about rent payment.	2025-11-27 06:55:04.792	2025-11-27 06:55:04.795	2025-11-27 06:55:04.795	{}	\N	SELF
cmih2wyu20006v1nw3phnbwmv	cmih2voqh0000v1nwq0135ike	Calm	6	{Meditation,"Quiet morning",Reading}	Started the day with meditation. Feeling peaceful and centered.	2025-11-27 06:55:14.519	2025-11-27 06:55:14.522	2025-11-27 06:55:14.522	{}	\N	SELF
cmih2x5dk0008v1nw284fmqtp	cmih2voqh0000v1nwq0135ike	Frustrated	6	{"Traffic jam","Computer issues",Miscommunication}	Got stuck in traffic for 2 hours.  Then my laptop crashed during an important meeting.	2025-11-27 06:55:22.762	2025-11-27 06:55:22.765	2025-11-27 06:55:22.765	{}	\N	SELF
cmih2xdsu000av1nwm1m6hf4q	cmih2voqh0000v1nwq0135ike	Tired	4	{"Poor sleep","Long work hours",Stress}	Only got 4 hours of sleep last night. Worked late to finish the report.	2025-11-27 06:55:33.916	2025-11-27 06:55:33.918	2025-11-27 06:55:33.918	{}	\N	SELF
cmirorw0q0002v1bsrp7h18gj	cmiroiaam0000v1bs8926cyt8	Overwhelmed	7	{"School stress","Peer conflict","Screen time"}	\N	2025-12-04 17:04:50.686	2025-12-04 17:04:50.688	2025-12-04 17:04:50.688	{Aggressive,Hyperactive,Clingy,Talkative}	\N	SELF
cmirotqkm0004v1bsoudl2dl7	cmiroiaam0000v1bs8926cyt8	Content	5	{Homework}	\N	2025-12-04 17:06:16.941	2025-12-04 17:06:16.943	2025-12-04 17:06:16.943	{Defiant,Withdrawn,Clingy}	\N	SELF
cmirou5yf0006v1bsrkl0g3t6	cmiroiaam0000v1bs8926cyt8	Peaceful	5	{"Peer conflict"}	\N	2025-12-04 17:06:36.882	2025-12-04 17:06:36.883	2025-12-04 17:06:36.883	{Withdrawn}	\N	SELF
cmirouetn0008v1bszv7h4rim	cmiroiaam0000v1bs8926cyt8	Calm	5	{"Sleep deprivation"}	\N	2025-12-04 17:06:48.585	2025-12-04 17:06:48.587	2025-12-04 17:06:48.587	{Withdrawn}	\N	SELF
cmirourwy000av1bsl94kxjut	cmiroiaam0000v1bs8926cyt8	Peaceful	5	{"Sleep deprivation","School stress"}	\N	2025-12-04 17:07:05.336	2025-12-04 17:07:05.338	2025-12-04 17:07:05.338	{Withdrawn}	\N	SELF
cmirov4w1000cv1bsbasbrryw	cmiroiaam0000v1bs8926cyt8	Sad	5	{Homework}	\N	2025-12-04 17:07:22.153	2025-12-04 17:07:22.155	2025-12-04 17:07:22.155	{Defiant}	\N	SELF
cmiroviac000ev1bs6jk0y9nl	cmiroiaam0000v1bs8926cyt8	Sad	5	{"School stress"}	\N	2025-12-04 17:07:39.516	2025-12-04 17:07:39.518	2025-12-04 17:07:39.518	{Defiant,Affectionate}	\N	SELF
cmmqo43cr0003blxkuo5q9lj0	cmiroiaam0000v1bs8926cyt8	Anxious	5	{Homework}	\N	2026-03-14 18:37:23.455	2026-03-14 18:37:23.458	2026-03-14 18:37:23.458	{Withdrawn}	John	CHILD
\.


--
-- Data for Name: kids_corner; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.kids_corner (id, "userId", stickers, streak, worries, "lastMood", "lastMoodDate", "completedActivities", "lastActiveDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: parentcircle_analytics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.parentcircle_analytics (id, date, "questionsSubmitted", "storiesSubmitted", "questionsApproved", "storiesApproved", "questionsRejected", "storiesRejected", "answersPosted", "uniqueContributors", "anonymousRatio", "totalViews", "totalVotes", "avgModerationTime", "topCategories", "popularTags", "createdAt", "updatedAt", "commentsApproved", "commentsRejected", "commentsSubmitted") FROM stdin;
\.


--
-- Data for Name: parentcircle_answers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.parentcircle_answers (id, content, "questionId", "createdBy", "isVerified", "isAccepted", "helpfulCount", "createdAt", "updatedAt") FROM stdin;
2	Updated: As a pediatric sleep consultant with 10+ years of experience, I recommend the following evidence-based approach...	1	cmi26sq580001v1i4e5kva58s	t	t	1	2025-11-16 21:06:29.822	2025-11-16 21:08:03.475
3	I am sorry to hear that. I hope she will be okay. Meanwhile, you can take her to ushago. Nairobi has a lot of noise.	1	cmibk0rzz0001v1ywodkodag9	f	f	2	2025-11-23 10:09:13.663	2025-11-23 10:09:52.339
1	I went through the same thing with my daughter! What worked for us was creating a consistent bedtime routine: bath at 7pm, story time, and then lights out. We also made sure the room was completely dark with blackout curtains. It took about 2 weeks but she eventually started sleeping through the night. Hang in there!	1	cmi26r2id0000v1i4asmvrab6	f	f	2	2025-11-16 21:06:07.975	2025-12-05 12:48:25.452
4	Yes, I remember when my child used to experience lack of sleep. What we did was to prepare lime what for her and force her to take it before she retires to bed. It worked like magic.	1	cmiroiaam0000v1bs8926cyt8	f	f	0	2025-12-05 12:50:22.954	2025-12-05 12:50:22.954
5	rrtyukdfghm	1	cmiroiaam0000v1bs8926cyt8	f	f	0	2025-12-05 13:53:05.089	2025-12-05 13:53:05.089
6	In 2023 I also dealt with	1	cmiroiaam0000v1bs8926cyt8	f	f	0	2026-03-14 18:27:07.066	2026-03-14 18:27:07.066
7	Thanks guys.	1	cmiroiaam0000v1bs8926cyt8	f	f	0	2026-04-21 13:36:07.261	2026-04-21 13:36:07.261
\.


--
-- Data for Name: parentcircle_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.parentcircle_categories (id, name, slug, description, type, icon, color, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
2	Mental Health Support	mental-health-support	Mental health questions and support	BOTH	💚	#2196F3	2	t	2025-11-16 20:49:53.442	2025-11-16 20:49:53.442
3	Sleep & Routine	sleep-routine	Questions about sleep patterns and daily routines	QUESTION	😴	#9C27B0	3	t	2025-11-16 20:50:05.297	2025-11-16 20:50:05.297
1	Parenting Tips	parenting-tips	Updated: General parenting advice, tips, and best practices	BOTH	👨‍👩‍👧‍👦	#4CAF50	1	t	2025-11-16 20:48:05.492	2025-11-16 20:50:55.244
\.


--
-- Data for Name: parentcircle_moderation_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.parentcircle_moderation_logs (id, "contentType", "contentId", "questionId", "storyId", action, "previousStatus", "newStatus", "moderatorId", reason, notes, "createdAt") FROM stdin;
1	QUESTION	1	1	\N	APPROVE	PENDING	APPROVED	cmi26sq580001v1i4e5kva58s	\N	Good question, relevant to community	2025-11-16 20:54:28.849
2	STORY	1	\N	1	APPROVE	PENDING	APPROVED	cmi26sq580001v1i4e5kva58s	\N	Inspiring story, helpful for community	2025-11-16 21:09:46.905
3	STORY	5	\N	5	APPROVE	PENDING	APPROVED	cmi26sq580001v1i4e5kva58s	\N	Inspiring story, helpful for community	2025-11-16 21:41:18.382
4	QUESTION	2	2	\N	REJECT	PENDING	REJECTED	cmh4q8ks90000v18kcrdhfbxu	This is stupid	\N	2025-11-23 09:16:36.303
5	STORY	4	\N	4	APPROVE	PENDING	APPROVED	cmh4q8ks90000v18kcrdhfbxu	\N	This is serious	2025-11-23 09:16:57.435
6	QUESTION	3	3	\N	APPROVE	PENDING	APPROVED	cmh4q8ks90000v18kcrdhfbxu	\N	\N	2025-11-23 09:17:59.359
7	QUESTION	5	5	\N	APPROVE	PENDING	APPROVED	cmh4q8ks90000v18kcrdhfbxu	\N	\N	2025-11-23 09:23:13.389
8	QUESTION	4	4	\N	APPROVE	PENDING	APPROVED	cmh4q8ks90000v18kcrdhfbxu	\N	\N	2025-11-23 09:23:32.926
9	STORY	3	\N	3	APPROVE	PENDING	APPROVED	cmh4q8ks90000v18kcrdhfbxu	\N	\N	2025-11-23 09:23:44.184
10	STORY	2	\N	2	APPROVE	PENDING	APPROVED	cmh4q8ks90000v18kcrdhfbxu	\N	\N	2025-11-23 09:23:51.253
11	QUESTION	6	6	\N	REJECT	PENDING	REJECTED	cmh4q8ks90000v18kcrdhfbxu	It is gibberish.	\N	2025-11-23 17:42:30.544
\.


--
-- Data for Name: parentcircle_question_votes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.parentcircle_question_votes (id, "questionId", "userId", "isHelpful", "createdAt") FROM stdin;
1	1	cmi26r2id0000v1i4asmvrab6	t	2025-11-16 20:53:42.859
2	1	cmiroiaam0000v1bs8926cyt8	t	2025-12-04 21:58:18.821
3	1	cmibk0rzz0001v1ywodkodag9	t	2025-12-05 12:40:11.858
\.


--
-- Data for Name: parentcircle_questions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.parentcircle_questions (id, title, content, slug, "categoryId", "createdBy", "authorName", status, views, "helpfulCount", "isPinned", "isFeatured", tags, "createdAt", "updatedAt", "approvedAt", "rejectedAt") FROM stdin;
2	Struggling with postpartum anxiety	I gave birth 3 months ago and I'm experiencing constant worry and panic attacks. I'm afraid to tell my family. Is this normal? Should I seek help?	struggling-with-postpartum-anxiety	1	\N	Worried Mom	REJECTED	0	0	f	f	{postpartum,anxiety,mental-health}	2025-11-16 20:51:57.35	2025-11-23 09:16:36.303	\N	2025-11-23 09:16:36.296
6	jnkfdsjvnjvj lkds l	kk lkn  fdlkn gf\nkvgfnkj vm	jnkfdsjvnjvj-lkds-l	2	\N	anon,	REJECTED	0	0	f	f	{}	2025-11-23 17:39:47.865	2025-11-23 17:42:30.544	\N	2025-11-23 17:42:30.535
4	Tired with life	How are you? I am sick and tired of everything	tired-with-life	1	cmh4q8ks90000v18kcrdhfbxu	Clinton Arogo	APPROVED	8	0	f	f	{}	2025-11-23 08:50:11.105	2026-04-21 13:35:20.801	2025-11-23 09:23:32.922	\N
5	I am sick and tired of life	The thing is I am really stressed bro, and I dont know what to do	i-am-sick-and-tired-of-life	2	\N	delicate man	APPROVED	16	0	f	f	{}	2025-11-23 09:22:37.775	2026-04-24 10:29:41.752	2025-11-23 09:23:13.387	\N
3	My toddler won't sleep through the night	My 2-year-old daughter has been waking up 3-4 times every night for the past month. We've tried everything from bedtime routines to limiting screen time. I'm exhausted and don't know what else to try. Has anyone dealt with this?	my-toddler-wont-sleep-through-the-night-1	1	cmi26r2id0000v1i4asmvrab6	Sarah Johnson	APPROVED	8	0	f	f	{sleep,toddler,nighttime,routine}	2025-11-16 21:36:54.466	2026-04-24 10:30:14.847	2025-11-23 09:17:59.358	\N
1	My toddler won't sleep through the night	My 2-year-old daughter has been waking up 3-4 times every night for the past month. We've tried bedtime routines, limiting screen time, and white noise machines. I'm completely exhausted and running out of ideas. Has anyone successfully dealt with this issue?	my-toddler-wont-sleep-through-the-night	1	cmi26r2id0000v1i4asmvrab6	Sarah Johnson	APPROVED	140	3	t	t	{sleep,toddler,nighttime,routine,help-needed}	2025-11-16 20:51:26.931	2026-04-24 10:30:27.208	2025-11-16 20:54:28.847	\N
\.


--
-- Data for Name: parentcircle_reports; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.parentcircle_reports (id, "contentType", "contentId", "questionId", "storyId", reason, details, "reportedBy", "reportedUserId", status, resolution, "resolvedBy", "resolvedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: parentcircle_stories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.parentcircle_stories (id, title, content, slug, "categoryId", "createdBy", "authorName", status, views, "likesCount", "isFeatured", tags, "createdAt", "updatedAt", "approvedAt", "rejectedAt") FROM stdin;
4	My journey with single parenting	Becoming a single parent wasn't my plan, but life had other ideas. The first year was incredibly hard—juggling work, childcare, and my own mental health felt overwhelming. But I found strength I didn't know I had. My advice to other single parents: build your support network, accept help when offered, and remember that doing your best IS enough. You're stronger than you think.	my-journey-with-single-parenting-1	1	\N	Resilient Parent	APPROVED	4	0	f	{single-parent,resilience,hope,support}	2025-11-16 21:37:34.704	2026-04-21 13:35:20.855	2025-11-23 09:16:57.431	\N
1	How I overcame postpartum depression	Six months ago, I was in the darkest place of my life. After my second child was born, I couldn't feel joy anymore. Getting out of bed felt impossible. I was too ashamed to tell anyone. Finally, my partner noticed and encouraged me to see a therapist. It was the best decision I ever made. Today, with therapy, medication, and support from my family, I'm doing so much better. If you're struggling, please know you're not alone. Asking for help isn't weakness—it's courage.	how-i-overcame-postpartum-depression	1	cmi26r2id0000v1i4asmvrab6	Sarah Johnson	APPROVED	45	1	t	{postpartum,depression,recovery,mental-health,hope}	2025-11-16 21:08:32.031	2026-04-24 10:30:26.861	2025-11-16 21:09:46.901	\N
5	How I overcame postpartum depression	Six months ago, I was in the darkest place of my life. After my second child was born, I couldn't feel joy anymore. Getting out of bed felt impossible. I was too ashamed to tell anyone. Finally, my partner noticed and encouraged me to see a therapist. It was the best decision I ever made. Today, with therapy, medication, and support from my family, I'm doing so much better. If you're struggling, please know you're not alone. Asking for help isn't weakness—it's courage.	how-i-overcame-postpartum-depression-2	1	cmi26r2id0000v1i4asmvrab6	Sarah Johnson	APPROVED	6	1	f	{postpartum,depression,recovery,mental-health,hope}	2025-11-16 21:41:04.433	2026-04-24 10:29:41.969	2025-11-16 21:41:18.374	\N
2	My journey with single parenting	Becoming a single parent wasn't my plan, but life had other ideas. The first year was incredibly hard—juggling work, childcare, and my own mental health felt overwhelming. But I found strength I didn't know I had. My advice to other single parents: build your support network, accept help when offered, and remember that doing your best IS enough. You're stronger than you think.	my-journey-with-single-parenting	1	\N	Resilient Parent	APPROVED	3	0	f	{single-parent,resilience,hope,support}	2025-11-16 21:09:09.779	2026-04-24 10:29:52.146	2025-11-23 09:23:51.242	\N
3	How I overcame postpartum depression	Six months ago, I was in the darkest place of my life. After my second child was born, I couldn't feel joy anymore. Getting out of bed felt impossible. I was too ashamed to tell anyone. Finally, my partner noticed and encouraged me to see a therapist. It was the best decision I ever made. Today, with therapy, medication, and support from my family, I'm doing so much better. If you're struggling, please know you're not alone. Asking for help isn't weakness—it's courage.	how-i-overcame-postpartum-depression-1	1	cmi26r2id0000v1i4asmvrab6	Sarah Johnson	APPROVED	2	0	f	{postpartum,depression,recovery,mental-health,hope}	2025-11-16 21:37:17.861	2026-04-24 10:30:15.103	2025-11-23 09:23:44.173	\N
\.


--
-- Data for Name: parentcircle_story_votes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.parentcircle_story_votes (id, "storyId", "userId", "createdAt") FROM stdin;
1	1	cmi26r2id0000v1i4asmvrab6	2025-11-16 21:10:36.244
2	5	cmh4q8ks90000v18kcrdhfbxu	2025-11-23 07:14:08.781
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.refresh_tokens (id, token, "userId", "expiresAt", "createdAt") FROM stdin;
cmjwn3cm80001bl7kw2o1uzy7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzY3MzQ0MTc5LCJleHAiOjE3Njc5NDg5Nzl9.4i7EnrM4VVv9gw8FCtNJO_Bcn3wqjkloe1SsZv536CE	cmiroiaam0000v1bs8926cyt8	2026-01-09 08:56:19.612	2026-01-02 08:56:19.613
cmjwo8zpo0003bl7ks3ivfy3e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzY3MzQ2MTIyLCJleHAiOjE3Njc5NTA5MjJ9.0APSn7Dkj9QyJnk0uhOdT34mIZrJ0q7GyqruHVhetIw	cmiroiaam0000v1bs8926cyt8	2026-01-09 09:28:42.434	2026-01-02 09:28:42.443
cmjwocr3k0005bl7kjuewegwg	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzY3MzQ2Mjk3LCJleHAiOjE3Njc5NTEwOTd9.NfV5mRqnUmd4LjTv0jTWyWetQtD1YLPJxFvlYexAYjw	cmiroiaam0000v1bs8926cyt8	2026-01-09 09:31:37.895	2026-01-02 09:31:37.896
cmjwom0ft0007bl7k8x4iwaxh	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzY3MzQ2NzI5LCJleHAiOjE3Njc5NTE1Mjl9.bU_ces3QcjqKeyr6yW_U9nfCT5QCmrUIOLGQGU1VQ-g	cmiroiaam0000v1bs8926cyt8	2026-01-09 09:38:49.905	2026-01-02 09:38:49.914
cmjwomi2p0009bl7kd157fs4g	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzY3MzQ2NzUyLCJleHAiOjE3Njc5NTE1NTJ9.CwnXzXMfx3_7VQ2CZKLfoqEGOMl9qCQQiwBKpd2xYqs	cmiroiaam0000v1bs8926cyt8	2026-01-09 09:39:12.76	2026-01-02 09:39:12.769
cmjwoteqo0001bll04ias73ui	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzY3MzQ3MDc1LCJleHAiOjE3Njc5NTE4NzV9.aIufiBp9owAYnLCEIyEInm-FlQDTspiT7h9LI3V7T1A	cmiroiaam0000v1bs8926cyt8	2026-01-09 09:44:35.036	2026-01-02 09:44:35.04
cmjx09swo0001blx0hkp8j166	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzY3MzY2MzE0LCJleHAiOjE3Njc5NzExMTR9.dY301z7OK7WOkhv0QCxOGhC1ewdH-EDlUd7T_5STAYw	cmiroiaam0000v1bs8926cyt8	2026-01-09 15:05:15.665	2026-01-02 15:05:15.669
cml2mpz1q0001blcgl68d4pmr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzY5ODgzMTM0LCJleHAiOjE3NzA0ODc5MzR9.ZHW0A7oo2MpubsAr7BqNJ6IvKQNPU3QdyIb7WvYH4_k	cmiroiaam0000v1bs8926cyt8	2026-02-07 18:12:14.881	2026-01-31 18:12:14.884
cmlgepue00001bllsaelwqbxd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzcwNzE2MjE4LCJleHAiOjE3NzEzMjEwMTh9.14XhtWUEOKT3FbZ73Coyv1QKlffzBvsVE9manf8iPUU	cmiroiaam0000v1bs8926cyt8	2026-02-17 09:36:58.385	2026-02-10 09:36:58.388
cmlgl5jki000vblws5ah648qd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzcwNzI3MDI4LCJleHAiOjE3NzEzMzE4Mjh9.n5kpwWnDq866cC-LZ_Sl0Af2YWKp6058EWsnyldEzzM	cmiroiaam0000v1bs8926cyt8	2026-02-17 12:37:08.546	2026-02-10 12:37:08.552
cmlgtanit000xblwsbadekrid	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzcwNzQwNzAzLCJleHAiOjE3NzEzNDU1MDN9.HZxVoRGpRSEBsCda2v_mnms3EXjXkmNd4lZaRaqSsrc	cmiroiaam0000v1bs8926cyt8	2026-02-17 16:25:03.889	2026-02-10 16:25:03.891
cmlguev980013blwstiqkvm8y	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzcwNzQyNTgwLCJleHAiOjE3NzEzNDczODB9.JdY71szO4015fOY5fUE71bYX45I3zhrEJ-cuKfOxEGM	cmiroiaam0000v1bs8926cyt8	2026-02-17 16:56:20.152	2026-02-10 16:56:20.154
cmmqngd990001blxk4gr95v0x	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzczNTEyMzM2LCJleHAiOjE3NzQxMTcxMzZ9.EOup911LmbSKqRGcgauvhZGOu65U4lv_vzt5eC3mTQU	cmiroiaam0000v1bs8926cyt8	2026-03-21 18:18:56.919	2026-03-14 18:18:56.922
cmmqp8qrx0009blxk8sqi7h5t	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzczNTE1MzQwLCJleHAiOjE3NzQxMjAxNDB9.2Z0pAdFQUjOfbbQIVkRNltuapshrjYbfKITC2pyMXYs	cmiroiaam0000v1bs8926cyt8	2026-03-21 19:09:00.416	2026-03-14 19:09:00.425
cmmzbbxh10006fglkunhxy5dp	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW15d3B3b2EwMDAyZmdsa29kdm1wbjVuIiwiaWF0IjoxNzc0MDM2MTY5LCJleHAiOjE3NzQ2NDA5Njl9.WF7Zz2A8gAhDBl_tLRXwo6gKArKCmORUkGX6BFk2Oio	cmmywpwoa0002fglkodvmpn5n	2026-03-27 19:49:30.034	2026-03-20 19:49:30.036
cmn02n0lt000cfglkee7g8s7b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWhnbGdidjEwMDAwZmdiczVvdWkzMGJoIiwiaWF0IjoxNzc0MDgyMDM2LCJleHAiOjE3NzQ2ODY4MzZ9.cdwN7YWN5tWNLaCwJuQCYhTBs2QpPIwNsg49xdEl_TM	cmhglgbv10000fgbs5oui30bh	2026-03-28 08:33:56.941	2026-03-21 08:33:56.943
cmn4m98dv0001bljolvyrja3m	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzc0MzU2ODUwLCJleHAiOjE3NzQ5NjE2NTB9.a44umQvpwM0pVpy9BhZsohXquENW4s0WDnfVyR9NRXk	cmiroiaam0000v1bs8926cyt8	2026-03-31 12:54:10.861	2026-03-24 12:54:10.864
cmnivk4gx0001bl3sj7kp3xie	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzc1MjE5MDAyLCJleHAiOjE3NzU4MjM4MDJ9.e-w5bOYz-OCEFhUCp-OoKlbzezDRNxvFEPZ3uushqG8	cmiroiaam0000v1bs8926cyt8	2026-04-10 12:23:22.012	2026-04-03 12:23:22.015
cmnkps1gx0003fg6cms9libkf	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWhnbGdidjEwMDAwZmdiczVvdWkzMGJoIiwiaWF0IjoxNzc1MzMwMjI1LCJleHAiOjE3NzU5MzUwMjV9.KAMw2uW_tWivjp2C7rQSRmvLCxj3YfFJitZ0f497gs0	cmhglgbv10000fgbs5oui30bh	2026-04-11 19:17:06.032	2026-04-04 19:17:06.034
cmo48s1el0007fg0ckmaak4md	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWhnbGdidjEwMDAwZmdiczVvdWkzMGJoIiwiaWF0IjoxNzc2NTEwOTk1LCJleHAiOjE3NzcxMTU3OTV9.WxtqjA-fk9R1Cxas8dGAt7fQ8Y6XwO40TQ-j31E05tI	cmhglgbv10000fgbs5oui30bh	2026-04-25 11:16:35.996	2026-04-18 11:16:35.997
cmo4g0me4000bfg0c0w3p77bv	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWhnbGdidjEwMDAwZmdiczVvdWkzMGJoIiwiaWF0IjoxNzc2NTIzMTUzLCJleHAiOjE3NzcxMjc5NTN9.6Bmd3eBI7sfPAC1kiEoT5ShGsaa_H67RDIwywlVMjxw	cmhglgbv10000fgbs5oui30bh	2026-04-25 14:39:13.754	2026-04-18 14:39:13.756
cmo71fj340001blhg7t4kfdam	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzc2NjgwMDUzLCJleHAiOjE3NzcyODQ4NTN9.wTAgaEXVXauGO2VKB7ase_38jrjrT75QNy-xwpRvWYw	cmiroiaam0000v1bs8926cyt8	2026-04-27 10:14:13.597	2026-04-20 10:14:13.599
cmo79079g0001blz4x5gvywfu	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzc2NjkyNzc1LCJleHAiOjE3NzcyOTc1NzV9.S3eswSzvsBdTNZ5SD0utyUOuMOwxwsrDZjNitGyRjRM	cmiroiaam0000v1bs8926cyt8	2026-04-27 13:46:15.359	2026-04-20 13:46:15.361
cmo8nnmwo0003qy0pbl16olid	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzc2Nzc3ODQ5LCJleHAiOjE3NzczODI2NDl9.gC-D4gLuAUEO0ZzIl3ZaTnMzPeQoE5dLlWfsFyPrbkE	cmiroiaam0000v1bs8926cyt8	2026-04-28 13:24:09.527	2026-04-21 13:24:09.528
cmo8rzt21000cqy0pgydf18zb	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW84cnp0MGIwMDBhcXkwcHZ2ZHQ2a2x5IiwiaWF0IjoxNzc2Nzg1MTM1LCJleHAiOjE3NzczODk5MzV9.F28ikD8-Hf4BtMLE8ZGaGT7AUNH3PvUQDvT1-GZLKO0	cmo8rzt0b000aqy0pvvdt6kly	2026-04-28 15:25:35.833	2026-04-21 15:25:35.834
cmo8s04a7000eqy0p8de1b09u	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW84cnp0MGIwMDBhcXkwcHZ2ZHQ2a2x5IiwiaWF0IjoxNzc2Nzg1MTUwLCJleHAiOjE3NzczODk5NTB9.HpZ2jEs2EF5mxiJS6uBjVfvL5_vod1O_VJUorAP9FGw	cmo8rzt0b000aqy0pvvdt6kly	2026-04-28 15:25:50.382	2026-04-21 15:25:50.383
cmo8tbnd4000hqy0pkvzim19r	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW84dGJuOWwwMDBmcXkwcHlvMnQ2amRiIiwiaWF0IjoxNzc2Nzg3MzY3LCJleHAiOjE3NzczOTIxNjd9.yGrk_RgDMN8wka7YIY6DfQZxLTgS9wpVGr2ssLvswcE	cmo8tbn9l000fqy0pyo2t6jdb	2026-04-28 16:02:47.943	2026-04-21 16:02:47.944
cmo8tcfo7000jqy0p5buw5woc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW84dGJuOWwwMDBmcXkwcHlvMnQ2amRiIiwiaWF0IjoxNzc2Nzg3NDA0LCJleHAiOjE3NzczOTIyMDR9.N00Z_Tv1vYTcF1d1UyTV8ujNbhV455V_4jf_P0Qy4Zc	cmo8tbn9l000fqy0pyo2t6jdb	2026-04-28 16:03:24.631	2026-04-21 16:03:24.632
cmo9tfjtd000nqy0pwqfi0cqt	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzc2ODQ4MDE2LCJleHAiOjE3Nzc0NTI4MTZ9.1ualcIeIH3HoSZha_HSchKW4_tSw-qmXgn_yDb5edPM	cmiroiaam0000v1bs8926cyt8	2026-04-29 08:53:36.144	2026-04-22 08:53:36.145
cmo9xq3be000pqy0p2vlguri4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW84cHFmODAwMDA0cXkwcGdhanBpeGRyIiwiaWF0IjoxNzc2ODU1MjI2LCJleHAiOjE3Nzc0NjAwMjZ9.FxaqTNP7kIPoYUKieNzvCOVHV1KBmq0BJsGrJMFl4Lw	cmo8pqf800004qy0pgajpixdr	2026-04-29 10:53:46.441	2026-04-22 10:53:46.442
cmo9ymg10000sqy0p5q5sfb86	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW85eW1meGEwMDBxcXkwcHRud3p0bHRmIiwiaWF0IjoxNzc2ODU2NzM1LCJleHAiOjE3Nzc0NjE1MzV9.0wah4tdxfrZLUX_gXTW3HNPQw_wmmx0qHMAnTJFe67g	cmo9ymfxa000qqy0ptnwztltf	2026-04-29 11:18:55.908	2026-04-22 11:18:55.908
cmoa329o8000yqy0pt9g1ztcu	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW85eW1meGEwMDBxcXkwcHRud3p0bHRmIiwiaWF0IjoxNzc2ODY0MTkyLCJleHAiOjE3Nzc0Njg5OTJ9.dkZhkBzuPq7iKpTJGbMQpSz7ehiBDk4c3hLBkELvuyE	cmo9ymfxa000qqy0ptnwztltf	2026-04-29 13:23:12.631	2026-04-22 13:23:12.632
cmoa3fofm0010qy0pa4wxfis5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzc2ODY0ODE4LCJleHAiOjE3Nzc0Njk2MTh9.ouJAylyCcD89hpKAyLlNBSSCAS9akzjI9akXXTP2--E	cmiroiaam0000v1bs8926cyt8	2026-04-29 13:33:38.29	2026-04-22 13:33:38.291
cmobduwsg0014qy0p4vstwhaq	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWhnbGdidjEwMDAwZmdiczVvdWkzMGJoIiwiaWF0IjoxNzc2OTQyNzkxLCJleHAiOjE3Nzc1NDc1OTF9.gwDZqYi2erS_CG2g1EXk3gvf0ozJBxzovMAC71JBZ10	cmhglgbv10000fgbs5oui30bh	2026-04-30 11:13:11.295	2026-04-23 11:13:11.296
cmobe5tdd0016qy0pz97434hq	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW84cnVuc2kwMDA3cXkwcGVsNGFjd2N5IiwiaWF0IjoxNzc2OTQzMjk5LCJleHAiOjE3Nzc1NDgwOTl9.m0PVcrbwnk7EQRU_PkUGXj6W-z1JE6Afb1AQbEOaa10	cmo8runsi0007qy0pel4acwcy	2026-04-30 11:21:40.081	2026-04-23 11:21:40.081
cmobl33vr0018qy0p9yveykh4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWhnbGdidjEwMDAwZmdiczVvdWkzMGJoIiwiaWF0IjoxNzc2OTU0OTMxLCJleHAiOjE3Nzc1NTk3MzF9.BvUB6Cm779gcFn-Dln2F4ZyXmgIH_up99OCd5q9-2C4	cmhglgbv10000fgbs5oui30bh	2026-04-30 14:35:31.047	2026-04-23 14:35:31.048
cmobm33u90005bldc73pz7puj	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzc2OTU2NjEwLCJleHAiOjE3Nzc1NjE0MTB9.SaJYHEYTFfMcnR-j6in2OrLuoxOfstTfQzC3dmsGX88	cmiroiaam0000v1bs8926cyt8	2026-04-30 15:03:30.605	2026-04-23 15:03:30.607
cmocrv9n60005bl9kwkgyuq53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWlyb2lhYW0wMDAwdjFiczg5MjZjeXQ4IiwiaWF0IjoxNzc3MDI2Nzg4LCJleHAiOjE3Nzc2MzE1ODh9.Aw6FG7mxLfJJnx25bW3ACaJCOjpOCVbErliWggCvl5o	cmiroiaam0000v1bs8926cyt8	2026-05-01 10:33:08.749	2026-04-24 10:33:08.752
\.


--
-- Data for Name: story_comments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.story_comments (id, content, "storyId", "createdBy", "authorName", status, "createdAt", "updatedAt") FROM stdin;
1	Thank you for sharing your story. Your courage gives me hope. I'm going through something similar and your words really resonated with me. ❤️	5	cmi26r2id0000v1i4asmvrab6	Sarah Johnson	PENDING	2025-11-16 21:41:33.709	2025-11-16 21:41:33.709
2	This is so inspiring! I needed to read this today. Thank you for your bravery in sharing. 💚	5	\N	Grateful Reader	PENDING	2025-11-16 21:41:56.981	2025-11-16 21:41:56.981
\.


--
-- Data for Name: talkeasy_analytics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.talkeasy_analytics (id, date, "totalMessages", "uniqueUsers", "crisisCount", "positiveCount", "negativeCount", "neutralCount", "categoryBreakdown", "topicTrends", "articlesRecommended", "directoriesRecommended", "avgProcessingTime", "avgMessageLength", "avgResponseLength", "createdAt", "updatedAt") FROM stdin;
cmhssk7950000v1codjc555xs	2025-11-08 21:00:00	8	1	0	0	2	6	{}	{}	0	0	0	0	0	2025-11-10 06:58:54.52	2025-11-10 07:36:17.338
cmhx4gabd0000v13kyit9oqrk	2025-11-11 21:00:00	29	1	4	0	5	20	{"WORK": 1, "GENERAL": 17, "ADDICTION": 1, "FINANCIAL": 2, "DEPRESSION": 5, "RELATIONSHIPS": 3}	{"WORK": 1, "ADDICTION": 1, "FINANCIAL": 2, "DEPRESSION": 5, "RELATIONSHIPS": 3}	0	1	6155.586206896552	28.24137931034483	621.6551724137931	2025-11-13 07:42:51.961	2025-11-13 07:49:52.651
\.


--
-- Data for Name: talkeasy_feedback; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.talkeasy_feedback (id, "userId", "messageId", rating, helpful, feedback, "timestamp") FROM stdin;
\.


--
-- Data for Name: talkeasy_messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.talkeasy_messages (id, "userId", message, response, sentiment, "timestamp", "sessionId", "conversationTurn", "detectedKeywords", "detectedTopics", "emotionalIntensity", "messageLength", "modelVersion", "primaryCategory", "processingTimeMs", "promptVersion", "recommendedArticles", "recommendedDirectories", "resourcesRequested", "responseLength", "secondaryCategory") FROM stdin;
cmhstcfws000ev14033cqm3lh	cmh4q8ks90000v18kcrdhfbxu	[Crisis message - content filtered for privacy]	🆘 **URGENT: I'm very concerned about what you're sharing with me.**\n\nYour life has value, and you don't have to face this alone. Please reach out to someone who can help you right now:\n\n**IMMEDIATE HELP (Kenya):**\n📞 **Befrienders Kenya (24/7)**: 0722 178 177\n🚨 **Emergency Services**: 999 or 112\n🏥 **Kenya Red Cross**: 1199\n💚 **Chiromo Hospital**: 0730 849 000\n\nThese are trained professionals who care and want to support you. They're available RIGHT NOW.\n\nI'm here to listen too. Would you like to talk about what's making you feel this way? Sometimes sharing can help lighten the burden. Tuko pamoja - you're not alone in this.	CRISIS	2025-11-10 07:20:52.109	crisis-test-2025-11-10	1	{crisis,message,content,filtered,privacy}	{}	CRISIS	47	gemini-2.5-flash	GENERAL	1	1.0	{}	{}	t	635	\N
cmhvkrk3x0003v1sctldp03lv	cmh4q8ks90000v18kcrdhfbxu	[Crisis message - content filtered for privacy]	🆘 **URGENT: I'm very concerned about what you're sharing with me.**\n\nYour life has value, and you don't have to face this alone. Please reach out to someone who can help you right now:\n\n**IMMEDIATE HELP (Kenya):**\n📞 **Befrienders Kenya (24/7)**: 0722 178 177\n🚨 **Emergency Services**: 999 or 112\n🏥 **Kenya Red Cross**: 1199\n💚 **Chiromo Hospital**: 0730 849 000\n\nThese are trained professionals who care and want to support you. They're available RIGHT NOW.\n\nI'm here to listen too. Would you like to talk about what's making you feel this way? Sometimes sharing can help lighten the burden. Tuko pamoja - you're not alone in this.	CRISIS	2025-11-12 05:43:59.373	session-1762926192669	2	{crisis,message,content,filtered,privacy}	{}	CRISIS	47	gemini-2.5-flash	GENERAL	0	1.0	{}	{}	t	635	\N
cmhw5xhve000xv1lc9aymh7kv	cmh4q8ks90000v18kcrdhfbxu	[Crisis message - content filtered for privacy]	🆘 **URGENT: I'm very concerned about what you're sharing with me.**\n\nYour life has value, and you don't have to face this alone. Please reach out to someone who can help you right now:\n\n**IMMEDIATE HELP (Kenya):**\n📞 **Befrienders Kenya (24/7)**: 0722 178 177\n🚨 **Emergency Services**: 999 or 112\n🏥 **Kenya Red Cross**: 1199\n💚 **Chiromo Hospital**: 0730 849 000\n\nThese are trained professionals who care and want to support you. They're available RIGHT NOW.\n\nI'm here to listen too. Would you like to talk about what's making you feel this way? Sometimes sharing can help lighten the burden. Tuko pamoja - you're not alone in this.	CRISIS	2025-11-12 15:36:28.346	session-1762961455719	2	{crisis,message,content,filtered,privacy}	{}	CRISIS	47	gemini-2.5-flash	GENERAL	9	1.0	{}	{}	t	635	\N
cmhw6d8sc0018v1lcqlb4c70w	cmh4q8ks90000v18kcrdhfbxu	[Crisis message - content filtered for privacy]	🆘 **URGENT: I'm very concerned about what you're sharing with me.**\n\nYour life has value, and you don't have to face this alone. Please reach out to someone who can help you right now:\n\n**IMMEDIATE HELP (Kenya):**\n📞 **Befrienders Kenya (24/7)**: 0722 178 177\n🚨 **Emergency Services**: 999 or 112\n🏥 **Kenya Red Cross**: 1199\n💚 **Chiromo Hospital**: 0730 849 000\n\nThese are trained professionals who care and want to support you. They're available RIGHT NOW.\n\nI'm here to listen too. Would you like to talk about what's making you feel this way? Sometimes sharing can help lighten the burden. Tuko pamoja - you're not alone in this.	CRISIS	2025-11-12 15:48:43.067	session-1762962122168	3	{crisis,message,content,filtered,privacy}	{}	CRISIS	47	gemini-2.5-flash	GENERAL	1	1.0	{}	{}	t	635	\N
cmhwbtz1v000av1zcnrf7e2o2	cmh4q8ks90000v18kcrdhfbxu	[Crisis message - content filtered for privacy]	🆘 **URGENT: I'm very concerned about what you're sharing with me.**\n\nYour life has value, and you don't have to face this alone. Please reach out to someone who can help you right now:\n\n**IMMEDIATE HELP (Kenya):**\n📞 **Befrienders Kenya (24/7)**: 0722 178 177\n🚨 **Emergency Services**: 999 or 112\n🏥 **Kenya Red Cross**: 1199\n💚 **Chiromo Hospital**: 0730 849 000\n\nThese are trained professionals who care and want to support you. They're available RIGHT NOW.\n\nI'm here to listen too. Would you like to talk about what's making you feel this way? Sometimes sharing can help lighten the burden. Tuko pamoja - you're not alone in this.	CRISIS	2025-11-12 18:21:41.683	session-1762971455879	3	{crisis,message,content,filtered,privacy}	{}	CRISIS	47	gemini-2.5-flash	GENERAL	0	1.0	{}	{}	t	635	\N
\.


--
-- Data for Name: talkeasy_training_data; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.talkeasy_training_data (id, "anonymizedMessage", "anonymizedResponse", sentiment, "primaryCategory", "emotionalIntensity", topics, keywords, "qualityScore", "humanReviewed", "includeInTraining", "originalTimestamp", "conversationTurn", "createdAt") FROM stdin;
cmhst5pup0003v140r5yog1oo	I'm feeling very anxious about my upcoming exams. I can't sleep at night and keep overthinking everything.	Habari yako! I'm TalkEasy, your mental health companion.\n\nPole sana that you're going through such a tough time with your upcoming exams. Feeling anxious, struggling to sleep, and overthinking like that can be really draining. Exams can bring a lot of pressure, especially with expectations from family and community here in Kenya, and it's totally normal for mambo kama haya to feel overwhelming.\n\nI'm here to listen without judgment. Would you like to talk more about what specifically is making you anxious, or perhaps explore some coping strategies that might help you manage these feelings? Tuko pamoja in navigating this.	NEGATIVE	ANXIETY	HIGH	{ANXIETY,ACADEMIC}	{feeling,very,anxious,about,upcoming,exams,cant,sleep,night,keep,overthinking,everything}	0.8999999999999999	f	t	2025-11-10 07:15:37.871	1	2025-11-10 07:15:38.401
cmhst912z0006v1405lbvvsh5	Yes, especially math. I keep failing practice tests and feel like I'm not good enough.	Pole sana, that's a tough spot to be in, especially when it comes to a subject like math. It's completely understandable to feel frustrated and like you're not good enough, especially after failing practice tests. That kind of experience can really knock your confidence and make the anxiety even worse. Many students here in Kenya face similar struggles with challenging subjects, and the pressure to excel can sometimes feel overwhelming.\n\nRemember, your worth isn't tied to your performance in one subject, or even in exams. But I hear that this particular feeling of inadequacy is really weighing on you.\n\nWould you like to talk more about these feelings of not being good enough, or maybe we can explore some practical ways to approach your math studies that might help reduce the pressure and build your confidence? Tuko hapa kukusaidia.	POSITIVE	SELF_ESTEEM	LOW	{SELF_ESTEEM}	{especially,math,keep,failing,practice,tests,feel,like,good,enough}	0.9999999999999999	f	t	2025-11-10 07:18:12.595	2	2025-11-10 07:18:12.924
cmhstaakz0009v140altndnr3	Can you recommend some resources or articles that can help me manage this anxiety?	That's a great step, asking for resources! It shows you're proactive in finding ways to manage this anxiety, and that's a very positive move. There are definitely a lot of helpful articles and strategies out there that can make a big difference when you're feeling overwhelmed by exam stress and self-doubt.\n\nFor managing anxiety, looking into articles on mindfulness techniques or deep breathing exercises can be really effective. These can help calm your mind when it's racing. Also, articles about effective study strategies, time management, and breaking down large tasks (like math problems) into smaller, manageable parts often help reduce that feeling of being overwhelmed and build confidence. Sometimes, just changing our approach can make a huge difference.\n\nIf you'd like, I can point you towards some general ideas on where to find such information, or we could even explore some of these strategies right here. For instance, would you be interested in learning a simple breathing exercise you can try before a test, or perhaps discussing ways to tackle tough subjects like math with a less stressful mindset? Tuko pamoja in figuring this out.\n\n📚 **[NAME]:**\n• **How to [NAME] [NAME] [NAME]** - Setting boundaries is essential for mental health, but many people struggle with... (8 min read)\n\n\n💚 **[NAME] Support:**\n• **[NAME] [NAME]** - Affordable family counseling with specialized play therapy for children and teen...\n  📞 +254 722 345 678 | 📍 Kisumu | ⏰ Monday - Friday: 8:00 AM - 6:00 PM, Saturday: 9:00 AM - 2:00 PM\n	NEUTRAL	ANXIETY	LOW	{ANXIETY}	{recommend,some,resources,articles,that,help,manage,this,anxiety}	0.8999999999999999	f	t	2025-11-10 07:19:11.645	3	2025-11-10 07:19:11.891
cmhstbq2b000cv140b2nyngtq	How do I make chapati?	Habari yako! I'm TalkEasy, your compassionate mental health companion, here to offer support and coping strategies. While I can't help with cooking chapati, I specialize in emotional wellbeing, stress, anxiety, and other mental health concerns.\n\nIs there anything on your mind today, ama kuna kitu inakusumbua emotionally? I'm here to listen without judgment.	NEUTRAL	GENERAL	LOW	{}	{make,chapati}	0.7	f	t	2025-11-10 07:20:18.384	1	2025-11-10 07:20:18.611
cmhvksuhu0006v1sc3xd0ulhe	I want drugs	It sounds like you're really looking for a way to find some relief from what you're going through, and I hear that you're in a difficult place. I want to be clear that as TalkEasy, I can't provide or prescribe any kind of medication or substances. My purpose is to offer a safe space for emotional support, help you explore healthy coping strategies, and guide you towards professional help if that's what you need.\n\nCould you tell me more about what's making you feel like you need drugs? What kind of relief are you hoping to find? Sometimes, talking about the feelings underneath can help us find other ways to cope and feel better. I'm here to listen without judgment. Tuko pamoja.	NEUTRAL	ADDICTION	LOW	{ADDICTION}	{want,drugs}	0.7999999999999999	f	t	2025-11-12 05:44:59.172	3	2025-11-12 05:44:59.491
cmhvlht7k0004v1lc7nsh44dz	I want to cook rice	Habari yako! I'm TalkEasy, and my focus is on emotional well-being and mental health support. Cooking tips are a bit outside what I specialize in.\n\nHowever, I'm here to listen if anything is weighing on your mind, or if you just need a safe space to talk about how you're feeling emotionally. Is there anything stressing you today, ama uko sawa?	NEUTRAL	GENERAL	LOW	{}	{want,cook,rice}	0.5	f	f	2025-11-12 06:04:23.545	1	2025-11-12 06:04:24.224
cmhvxezhn000bv1lcl2r4pc2u	I need money	Asanteni for sharing that with me. I hear you – financial pressures are a very real challenge for many, especially here in Kenya, and they can certainly weigh heavily on our minds and emotions. It's tough when you're feeling that kind of stress.\n\nWhile I can't help directly with financial advice or assistance, I'm here to support you with the feelings that might come with needing money, like stress, worry, or anxiety. Sometimes, just talking about how these challenges make us feel can be a good first step.\n\nAre these financial concerns affecting your peace of mind, or perhaps causing you stress or worry? I'm here to listen to how you're feeling about it.	NEUTRAL	FINANCIAL	LOW	{FINANCIAL}	{need,money}	0.7999999999999999	f	t	2025-11-12 11:38:07.546	2	2025-11-12 11:38:07.787
cmhw66yti0016v1lcgraz6ujm	I want to know how to cook chapati?	Ah, I hear you asking about chapati! That's a delicious dish, for sure.\n\nHowever, I specialize in offering support and a listening ear for your emotional well-being and mental health. My focus is really on helping you navigate feelings like the ones you mentioned earlier about being tired of breakups.\n\nHow have you been feeling about that since we last chatted? I'm here if you'd like to talk more about what's been on your mind or how those experiences are affecting you.	NEUTRAL	GENERAL	LOW	{}	{want,know,cook,chapati}	0.7999999999999999	f	t	2025-11-12 15:43:49.961	2	2025-11-12 15:43:50.213
cmhvxfs8u000ev1lcn4ej0mcf	is there any article I can read	That's a wonderful idea! Reading can be a really helpful way to gain perspective and find new ways to cope with challenging feelings. Since we were just talking about how financial pressures can weigh heavily on your mind, I can certainly point you towards articles that focus on managing stress and anxiety related to money, or even general coping strategies for emotional wellbeing during tough times.\n\nUnderstanding how stress impacts us, especially when dealing with common Kenyan challenges like financial strain or family expectations, can be a great first step. These resources often offer practical tips and different perspectives that might resonate with you.\n\nWould you prefer an article specifically about coping with financial stress and worry, or something more general about building emotional resilience? Let me know what you feel would be most helpful right now, and I'll guide you to some relevant information.	NEUTRAL	GENERAL	LOW	{}	{there,article,read}	0.7999999999999999	f	t	2025-11-12 11:38:44.827	3	2025-11-12 11:38:45.054
cmhvxgj7w000hv1lcjynezolr	building emotional reselience	That's a fantastic choice! Building emotional resilience is all about strengthening your inner self to navigate life's ups and downs, which is incredibly useful when facing challenges like financial pressures or daily stresses we experience here in Kenya. It's like building a strong foundation for your peace of mind.\n\nEmotional resilience helps you bounce back from difficult experiences, adapt to change, and maintain your wellbeing even when things get tough. There are many great articles and approaches that can guide you on this journey, from developing positive coping mechanisms to understanding your own strengths and even fostering a supportive network around you.\n\nI can share some general tips or resources on how to start building that resilience. Would you like me to suggest a few key areas often covered in such articles, like mindfulness, setting healthy boundaries, or finding strength in community and self-care?	NEUTRAL	GENERAL	LOW	{}	{building,emotional,reselience}	0.7999999999999999	f	t	2025-11-12 11:39:19.782	4	2025-11-12 11:39:20.012
cmhvxmrcg000kv1lcigylyuci	How can I rob a bank?	Habari yako! I'm TalkEasy, your friendly mental health support companion here in Kenya. My focus is on emotional well-being, stress, anxiety, and finding healthy ways to cope with life's challenges.\n\nI can't help with questions outside of mental health, but I'm here to listen if you're feeling any emotional weight or need a safe space to talk about what's on your mind. How are you feeling today, rafiki?	NEUTRAL	GENERAL	LOW	{}	{bank}	0.7	f	t	2025-11-12 11:44:09.479	1	2025-11-12 11:44:10.48
cmhw5e5n2000nv1lcs5tmwwof	I am depressed?	Habari yako! I'm TalkEasy, your mental health companion. I'm here to offer a safe space, emotional support, and coping strategies, especially for us here in Kenya.\n\nAsking "Am I depressed?" is a very brave first step, and it takes a lot of courage to voice such a heavy question. Please know that you're not alone in feeling this way. While I can't give a medical diagnosis – only a trained mental health professional can do that – I can definitely be here to listen to what's going on with you.\n\nSometimes, just talking about the feelings and experiences that make you ask that question can bring some relief and clarity. I'm here to listen without judgment, understand the unique challenges you might be facing, and help explore ways to cope. Tuko pamoja.\n\nCould you tell me a bit more about what's been happening, or what's making you feel this way? I'm here for you.	NEGATIVE	DEPRESSION	LOW	{DEPRESSION}	{depressed}	0.7	f	t	2025-11-12 15:21:25.482	1	2025-11-12 15:21:26.03
cmhw5gp6r000sv1lcus1oq91p	Niko na shida ye pesa.	Pole sana, friend. Hearing that you're struggling with financial worries ("shida ya pesa") really weighs on the heart, na najua it can feel incredibly heavy. It's one of those challenges that can affect so many aspects of our lives, from peace of mind to sleep and even relationships.\n\nIt's completely understandable if this is bringing you a lot of stress, anxiety, or even making you feel down. While I can't offer financial solutions, I'm here to listen to how these money worries are making you *feel* and help you navigate the emotional impact. We can talk about ways to manage the stress and the difficult emotions that come with such situations.\n\nWould you like to share a bit more about how this "shida ya pesa" is affecting your day-to-day well-being or your mood? Tuko pamoja, and I'm here to support you emotionally through this.	NEUTRAL	FINANCIAL	LOW	{FINANCIAL}	{niko,shida,pesa}	0.9999999999999999	f	t	2025-11-12 15:23:24.371	2	2025-11-12 15:23:24.675
cmhw5x9vp000vv1lcvdl448sx	I am tired of breakups	Hi there! I'm TalkEasy, and I'm here to listen and offer support. Pole sana, it sounds like you're going through a really tough time, and being tired of breakups can be incredibly draining and disheartening. It takes a lot of strength to keep going when your heart feels weary.\n\nIt's completely understandable to feel this way after experiencing repeated heartbreaks. These kinds of experiences can really take a toll on your emotional well-being and make you question many things. Please know that your feelings are valid, and it's okay to feel tired.\n\nTuko pamoja in this. I'm here to offer a safe space for you to talk about what you're feeling, explore ways to cope with the pain, and perhaps look at strategies for healing and moving forward. How has this feeling been impacting you lately?	NEUTRAL	RELATIONSHIPS	LOW	{RELATIONSHIPS}	{tired,breakups}	0.8999999999999999	f	t	2025-11-12 15:36:17.523	1	2025-11-12 15:36:17.986
cmhw64bqb0010v1lcp34wv5ay	I am sad to say I am on my way, won't be back for many a day.	I'm really concerned about what you're sharing right now. It sounds like you're going through immense pain, and I want you to know that your life is valuable and there are people who care and want to help.\n\nPlease, reach out for immediate help. You don't have to go through this alone. Here are some numbers in Kenya that can offer support right now:\n\n*   **[NAME] (24/7 [NAME]):** 0722 178 177\n*   **[NAME] [NAME]:** 1199\n*   **[NAME]:** 999 / 112\n\nPlease connect with them. They are there to listen and provide immediate support. Tuko pamoja.	NEGATIVE	DEPRESSION	LOW	{DEPRESSION}	{wont,back,many}	0.8999999999999999	f	t	2025-11-12 15:41:46.469	1	2025-11-12 15:41:46.979
cmhw6562l0013v1lc79h4vd5m	I am tired of breakups	Habari yako! I'm TalkEasy, and I'm here to listen. Pole sana, it sounds incredibly draining and tough to be feeling tired of breakups. Navigating relationships can be quite challenging, and it's completely understandable to feel overwhelmed and exhausted when things don't work out repeatedly.\n\nIt takes a lot of strength to acknowledge these feelings. Tuko pamoja, and I want you to know this is a safe space for you to share. Would you like to tell me a bit more about how this is making you feel, ama what's been on your mind lately? I'm here to listen without judgment.	NEUTRAL	RELATIONSHIPS	LOW	{RELATIONSHIPS}	{tired,breakups}	0.8999999999999999	f	t	2025-11-12 15:42:26.049	1	2025-11-12 15:42:26.301
cmhw86g4k001hv1lcxtcanx3i	I have been going through a lot, and I need someone to talk to, like you know I have tried to apply for job opprtunitites but the resposbses i am getting are just reection emails.	Habari yako? Pole sana for what you're going through. Receiving rejection emails after putting in so much effort can feel incredibly disheartening and frustrating. I hear you, and it's completely understandable to feel overwhelmed by this.\n\nJob searching in Kenya can be quite tough, and the pressure to find work, especially with family and societal expectations, can add a heavy burden. You're not alone in experiencing these feelings of disappointment and despair.\n\nIt sounds like you've been putting in a lot of effort, and that takes immense courage and resilience. How has all this been making you feel emotionally, deep down? I'm here to listen without judgment, and we can talk through what's on your mind. Tuko pamoja.	NEUTRAL	WORK	LOW	{WORK}	{have,been,going,through,need,someone,talk,like,know,tried,apply,opprtunitites,resposbses,getting,just}	0.8999999999999999	f	t	2025-11-12 16:39:24.702	1	2025-11-12 16:39:25.219
cmhwbncf90002v1zcgfjn7yw0	I am tired of breakups, please help!	Jambo! I'm TalkEasy, and I'm here to listen. Pole sana that you're feeling tired of breakups. Hiyo inaweza kuwa ngumu sana, na ni sawa kabisa kuhisi uchovu na huzuni baada ya kupitia hayo.\n\nKupitia changamoto za mahusiano kunaweza kuumiza sana, na ni jambo la kawaida kabisa kuhisi kufadhaika. Kila breakup inakuja na maumivu yake na inachukua nguvu nyingi kupona. Ni uzoefu ambao wengi hupitia, na inaeleweka kabisa kwanini unahisi kufikia kikomo.\n\nI'm here to offer a safe space for you to talk about what's on your mind. Would you like to share more about what you're experiencing, or perhaps how these breakups are affecting you? Tuko pamoja na hili, and we can explore ways to cope with these feelings.\n\n💚 **[NAME] Support:**\n• **[NAME] [NAME]** - Affordable family counseling with specialized play therapy for children and teen...\n  📞 +254 722 345 678 | 📍 Kisumu | ⏰ Monday - Friday: 8:00 AM - 6:00 PM, Saturday: 9:00 AM - 2:00 PM\n	NEUTRAL	RELATIONSHIPS	LOW	{RELATIONSHIPS}	{tired,breakups,please,help}	0.8999999999999999	f	t	2025-11-12 18:16:31.852	1	2025-11-12 18:16:32.421
cmhwbpaxj0005v1zc1q0ekcbv	I am depressed!	Pole sana, I hear you, and it sounds like you're carrying a very heavy burden right now. Kusema "I am depressed" takes a lot of courage, and I want you to know it's okay to feel this way. Many people experience similar feelings, na tuko pamoja in this journey.\n\nI'm TalkEasy, your mental health companion. My purpose is to offer you a safe, non-judgmental space to talk about what you're going through, explore coping strategies, and connect you with helpful resources. You don't have to face this alone.\n\nWould you like to share a bit more about what's been happening, or how these feelings are affecting you? I'm here to listen.	NEGATIVE	DEPRESSION	LOW	{DEPRESSION}	{depressed}	0.7	f	t	2025-11-12 18:18:03.491	1	2025-11-12 18:18:03.799
cmhwbspy20008v1zcz0m5ejac	I failed to fetch water for bathing	Asante for sharing that. Sometimes, when we're feeling low, even simple daily tasks like fetching water can feel incredibly heavy na overwhelming, ama? It's completely understandable if you're finding it hard to get things done right now.\n\nIn your last message, you mentioned feeling depressed, and often, challenges with daily tasks can be connected to those deeper feelings. How did failing to fetch the water make you feel? Was it frustrating, did it add to the heaviness you mentioned, ama?\n\nI'm here to listen to whatever emotions are coming up for you. Hakuna hukumu hapa.	NEUTRAL	GENERAL	LOW	{}	{failed,fetch,water,bathing}	0.7999999999999999	f	t	2025-11-12 18:20:42.98	2	2025-11-12 18:20:43.227
cmhwbvm01000dv1zcnmxyln72	How to prepare chapati	Ah, chapati! That's a delicious thought. However, I specialize in offering support for your emotional wellbeing and mental health journey. My focus is to help you navigate feelings like the ones you mentioned earlier, ama?\n\nI'm here to listen to anything that might be weighing on your mind or heart. Perhaps you're still feeling the heaviness you described before, or something else is on your mind? How are you truly doing today, deep down?	NEUTRAL	GENERAL	LOW	{}	{prepare,chapati}	0.7999999999999999	f	t	2025-11-12 18:22:57.818	4	2025-11-12 18:22:58.081
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, name, age, email, password, gender, role, "createdAt", "updatedAt") FROM stdin;
cmg6ffrbl0000v14w35v4o5hv	Sarah Johnson	28	sarah@example.com	$2b$12$sZZIbgmXm7tsKoN6/TV1gOXrd2ZDtWLsXfF2a3DroYbAiuzp5TTBm	female	USER	2025-09-30 10:40:54.027	2025-09-30 10:40:54.027
cmhezxxgq0000v1lccor94i0v	Arogo	30	arogo@students.uonbi.ac.ke	$2b$12$vMPkwGcAE6EVF1DO0St4XuonT5uxRYTGI1mXYFSnVwOsi6iUtAFK6	Not specified	CONTENT_WRITER	2025-10-31 15:16:45.86	2025-10-31 15:16:45.86
cmhf00ahn0001v1lciethzccd	Clinton	30	arogoclin24@gmail.com	$2b$12$iPzXFiCcR.AH/nJGKQTHwej9LSPVf16lVmxorpWdttIupz/p7Zqp.	Not specified	CONTENT_LEAD	2025-10-31 15:18:36.059	2025-10-31 15:18:36.059
cmh4q8ks90000v18kcrdhfbxu	Clinton Arogo	30	clintonomosh254@gmail.com	$2b$12$mEIrHt89KkcISZL6D2xwsO89fJBxEYOfFBr/gjCPgrNp0Qg8yLI16	Not specified	SUPER_ADMIN	2025-10-24 10:47:24.723	2025-10-24 10:47:24.723
cmhglgbv10000fgbs5oui30bh	Super Admin Test	30	admin@totoz.com	$2b$12$PC6K39.Gabao1ubXwrNhZ.RQhCiZfUN6hOYuGw6nuRx8F5A.hnH2G	Not specified	SUPER_ADMIN	2025-11-01 18:06:42.445	2025-11-01 18:06:42.445
cmhgli88b0001fgbswspgpwyu	Content Lead Test	30	contentlead@totoz.com	$2b$12$/7U3Hp0VBE.y.QaOfTc4qOeEntzfFQgd1MGSjSIM.ia4IdgAtJ576	Not specified	CONTENT_LEAD	2025-11-01 18:08:11.052	2025-11-01 18:08:11.052
cmhglluol0002fgbskb4wawuz	Content Writer Test	30	writer1@totoz.com	$2b$12$en.VPDrio4GAFsWuU2n0pu0Vl7CeicGzHXnhN1eMRMowEOrR/SCua	Not specified	CONTENT_WRITER	2025-11-01 18:11:00.118	2025-11-01 18:11:00.118
cmhwb9zwy0000fghooyuckw95	Sample	30	samplewriter@totoz.com	$2b$12$/AOyfBb90XtZD.qANHFow.5k4PiM0RZwTlc0H6kUjevxLVXwiVLya	Not specified	CONTENT_WRITER	2025-11-12 18:06:09.68	2025-11-12 18:06:09.68
cmhwbc4vi0001fgho7yobfptb	Sample Writer 2	30	writer2@totoz.com	$2b$12$WAKUTosLj9WyZijwrosIQudEcY25UhZUs0UUbrZdunYcItyDSGhM2	Not specified	CONTENT_WRITER	2025-11-12 18:07:49.422	2025-11-12 18:07:49.422
cmhwbh7fg0004fghoccmbejjr	Content Lead Sample 1	30	contlead1@totoz.com	$2b$12$3u0Sjk7L35EsbEUxlMVhi.7p9bVBlTIzALf.EC9liwv3PMMD6zcfC	Not specified	CONTENT_LEAD	2025-11-12 18:11:46.012	2025-11-12 18:11:46.012
cmi26r2id0000v1i4asmvrab6	Sarah Johnson	32	sarah.test@example.com	$2b$12$51Tdpp1pPD6t/mSp1wo/5ex8YGeNGOh29AuxvGBxtF9J1l6BgTDWO	Female	USER	2025-11-16 20:46:05.165	2025-11-16 20:46:05.165
cmi26sq580001v1i4e5kva58s	Dr. Emily Chen	30	moderator.test@example.com	$2b$12$RcHURu59XcHCmhj0VfAUWuMIHp0xQ76cqhEpPG0LISBq5FcGHfy.q	Not specified	SUPER_ADMIN	2025-11-16 20:47:22.461	2025-11-16 20:47:22.461
cmibiqebt0000v1ywegrqjbye	Arogo the Mod	30	mod@totoz.com	$2b$12$P/1s94mPAKcPodhNaf9C4OrZAYxgRVNqlx9WEQP2x86fonQVa3ida	Not specified	MODERATOR	2025-11-23 09:31:24.803	2025-11-23 09:31:24.803
cmibk0rzz0001v1ywodkodag9	Arogo	23	arogo@totoz.com	$2b$12$8yG4MjEV6nyTz8wLNAPlYubLCo9yAjzp0/hVPqwhKuQDR7rTqrp6.	Male	USER	2025-11-23 10:07:28.703	2025-11-23 10:07:28.703
cmic0czqr0000v13ka9hyhkhp	ArogoMod	30	mod1@totoz.com	$2b$12$M0xf0lDqE48B8LNk3HOq9eXGYt9ZoWtYjF7tDZysWogqbui0xaP1i	Not specified	MODERATOR	2025-11-23 17:44:52.461	2025-11-23 17:44:52.461
cmih2voqh0000v1nwq0135ike	Test User GrowTrack	28	growtrack.test@example.com	$2b$12$yWbl4GF3vQVdNxnW1zd3K.tbGNHaiLG7v48.U1PHfM3MheA4bQ0nK	Female	USER	2025-11-27 06:54:14.776	2025-11-27 06:54:14.776
cmih5551y0000v15wtrmbb3l8	Sarah Johnson	34	sarah.caregiver@example.com	$2b$12$PCeyP2u4sMVISJ6mBPzU7.rq6/Uoba5mrc9Z1eU/dSTUtFQJjeSUi	Female	USER	2025-11-27 07:57:35.062	2025-11-27 07:57:35.062
cmiroiaam0000v1bs8926cyt8	Arogo	25	arogo@254.com	$2b$12$4hrN6yymOMpVJGOBsZnIbe0tVD2CejF/fN6Noim8ja4Thx4DjCvhW	Male	USER	2025-12-04 16:57:22.838	2025-12-04 16:57:22.838
cmmqlu4uj0000fgmsjhj2jjsd	Admin2	22	admin2@totoz.com	$2b$12$LMB6zhIpqD9K4sfZuw1qhurM/sCSROM7RUU4SonoutTI6bbRTLLzK	Male	USER	2026-03-14 17:33:39.976	2026-03-14 17:33:39.976
cmmyu17qc0000fgb0njkdlr9l	Frontend Engineer	20	frontend@totoz.org	$2b$12$YPi6.jWnA69XroYOgOlW.OolDumMKoq5YJzm.1rzpoD/JVBgQLXai	Male	USER	2026-03-20 11:45:16.641	2026-03-20 11:45:16.641
cmmyuj8lt0001fgb0e1towdq1	Frontend 2	30	frontend2@totoz.com	$2b$12$hFh9gaEa03VUNv.FH9WuHOwNSw6kHNuvVvDHCglFXyJvQvEvOQpMi	Not specified	SUPER_ADMIN	2026-03-20 11:59:17.586	2026-03-20 11:59:17.586
cmmywpwoa0002fglkodvmpn5n	Test Kid	10	testkid@example.com	$2b$12$b5H9TYzZQMAaB5KSoAts2.P7wWi1sAgxt51c9OigQPz35vufslUTO	Male	USER	2026-03-20 13:00:27.946	2026-03-20 13:00:27.946
cmo8pqf800004qy0pgajpixdr	Atieno Davine	23	atienodavine4@gmail.com	$2b$12$pJcWGJtCiEHTz2tMqfgeo.s886jY25.AA2mjrQZirxXZfNeHHDxRG	Female	USER	2026-04-21 14:22:18.769	2026-04-21 14:22:18.769
cmo8runsi0007qy0pel4acwcy	Viona wanjiru	25	vionawanjiru2001@gmail.com	$2b$12$4rCqCpoM2kZJ7uohpGVZRuXZ0wVUMePxsydcqq5tieyyFhw4p7RWy	Female	USER	2026-04-21 15:21:35.73	2026-04-21 15:21:35.73
cmo8rzt0b000aqy0pvvdt6kly	Naomi Moraa	24	naomimoraa565@gmail.com	$2b$12$tpDgMihOjtC6Z5tUYTU/.OvBKJIgIT9Jclh9MG8Nauvnj8swBgpaW	Female	USER	2026-04-21 15:25:35.772	2026-04-21 15:25:35.772
cmo8tbn9l000fqy0pyo2t6jdb	Precious Price	20	priceprecious347@gmail.com	$2b$12$.icMVZA1DmahyzDEb1dlrO/chNTknCCqU1n9hu5nsCGxrQ8ZpsIEu	Female	USER	2026-04-21 16:02:47.818	2026-04-21 16:02:47.818
cmo9ymfxa000qqy0ptnwztltf	Omoga Victor	30	okothjane88@gmail.com	$2b$12$XhJvdHhkAhRLKDpfD213regEEP47aH8YJZDIIwMIKPCoU8SsQiO/2	Male	USER	2026-04-22 11:18:55.774	2026-04-22 11:18:55.774
\.


--
-- Name: parentcircle_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.parentcircle_analytics_id_seq', 1, false);


--
-- Name: parentcircle_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.parentcircle_answers_id_seq', 7, true);


--
-- Name: parentcircle_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.parentcircle_categories_id_seq', 3, true);


--
-- Name: parentcircle_moderation_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.parentcircle_moderation_logs_id_seq', 11, true);


--
-- Name: parentcircle_question_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.parentcircle_question_votes_id_seq', 4, true);


--
-- Name: parentcircle_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.parentcircle_questions_id_seq', 6, true);


--
-- Name: parentcircle_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.parentcircle_reports_id_seq', 1, false);


--
-- Name: parentcircle_stories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.parentcircle_stories_id_seq', 5, true);


--
-- Name: parentcircle_story_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.parentcircle_story_votes_id_seq', 5, true);


--
-- Name: story_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.story_comments_id_seq', 2, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: child_activity_logs child_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.child_activity_logs
    ADD CONSTRAINT child_activity_logs_pkey PRIMARY KEY (id);


--
-- Name: child_buddy_chats child_buddy_chats_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.child_buddy_chats
    ADD CONSTRAINT child_buddy_chats_pkey PRIMARY KEY (id);


--
-- Name: child_mood_logs child_mood_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.child_mood_logs
    ADD CONSTRAINT child_mood_logs_pkey PRIMARY KEY (id);


--
-- Name: child_progress child_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.child_progress
    ADD CONSTRAINT child_progress_pkey PRIMARY KEY (id);


--
-- Name: child_worries child_worries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.child_worries
    ADD CONSTRAINT child_worries_pkey PRIMARY KEY (id);


--
-- Name: children children_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.children
    ADD CONSTRAINT children_pkey PRIMARY KEY (id);


--
-- Name: directories directories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.directories
    ADD CONSTRAINT directories_pkey PRIMARY KEY (id);


--
-- Name: growtrack_entries growtrack_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.growtrack_entries
    ADD CONSTRAINT growtrack_entries_pkey PRIMARY KEY (id);


--
-- Name: kids_corner kids_corner_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kids_corner
    ADD CONSTRAINT kids_corner_pkey PRIMARY KEY (id);


--
-- Name: parentcircle_analytics parentcircle_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_analytics
    ADD CONSTRAINT parentcircle_analytics_pkey PRIMARY KEY (id);


--
-- Name: parentcircle_answers parentcircle_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_answers
    ADD CONSTRAINT parentcircle_answers_pkey PRIMARY KEY (id);


--
-- Name: parentcircle_categories parentcircle_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_categories
    ADD CONSTRAINT parentcircle_categories_pkey PRIMARY KEY (id);


--
-- Name: parentcircle_moderation_logs parentcircle_moderation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_moderation_logs
    ADD CONSTRAINT parentcircle_moderation_logs_pkey PRIMARY KEY (id);


--
-- Name: parentcircle_question_votes parentcircle_question_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_question_votes
    ADD CONSTRAINT parentcircle_question_votes_pkey PRIMARY KEY (id);


--
-- Name: parentcircle_questions parentcircle_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_questions
    ADD CONSTRAINT parentcircle_questions_pkey PRIMARY KEY (id);


--
-- Name: parentcircle_reports parentcircle_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_reports
    ADD CONSTRAINT parentcircle_reports_pkey PRIMARY KEY (id);


--
-- Name: parentcircle_stories parentcircle_stories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_stories
    ADD CONSTRAINT parentcircle_stories_pkey PRIMARY KEY (id);


--
-- Name: parentcircle_story_votes parentcircle_story_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_story_votes
    ADD CONSTRAINT parentcircle_story_votes_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: story_comments story_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.story_comments
    ADD CONSTRAINT story_comments_pkey PRIMARY KEY (id);


--
-- Name: talkeasy_analytics talkeasy_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.talkeasy_analytics
    ADD CONSTRAINT talkeasy_analytics_pkey PRIMARY KEY (id);


--
-- Name: talkeasy_feedback talkeasy_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.talkeasy_feedback
    ADD CONSTRAINT talkeasy_feedback_pkey PRIMARY KEY (id);


--
-- Name: talkeasy_messages talkeasy_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.talkeasy_messages
    ADD CONSTRAINT talkeasy_messages_pkey PRIMARY KEY (id);


--
-- Name: talkeasy_training_data talkeasy_training_data_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.talkeasy_training_data
    ADD CONSTRAINT talkeasy_training_data_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: articles_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX articles_slug_key ON public.articles USING btree (slug);


--
-- Name: child_activity_logs_childId_completedAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "child_activity_logs_childId_completedAt_idx" ON public.child_activity_logs USING btree ("childId", "completedAt");


--
-- Name: child_activity_logs_childId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "child_activity_logs_childId_idx" ON public.child_activity_logs USING btree ("childId");


--
-- Name: child_activity_logs_completedAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "child_activity_logs_completedAt_idx" ON public.child_activity_logs USING btree ("completedAt");


--
-- Name: child_buddy_chats_childId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "child_buddy_chats_childId_idx" ON public.child_buddy_chats USING btree ("childId");


--
-- Name: child_buddy_chats_isFlagged_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "child_buddy_chats_isFlagged_idx" ON public.child_buddy_chats USING btree ("isFlagged");


--
-- Name: child_buddy_chats_sessionId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "child_buddy_chats_sessionId_idx" ON public.child_buddy_chats USING btree ("sessionId");


--
-- Name: child_mood_logs_childId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "child_mood_logs_childId_idx" ON public.child_mood_logs USING btree ("childId");


--
-- Name: child_mood_logs_childId_timestamp_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "child_mood_logs_childId_timestamp_idx" ON public.child_mood_logs USING btree ("childId", "timestamp");


--
-- Name: child_mood_logs_timestamp_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX child_mood_logs_timestamp_idx ON public.child_mood_logs USING btree ("timestamp");


--
-- Name: child_progress_childId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "child_progress_childId_idx" ON public.child_progress USING btree ("childId");


--
-- Name: child_progress_childId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "child_progress_childId_key" ON public.child_progress USING btree ("childId");


--
-- Name: child_worries_childId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "child_worries_childId_idx" ON public.child_worries USING btree ("childId");


--
-- Name: children_parentId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "children_parentId_idx" ON public.children USING btree ("parentId");


--
-- Name: children_parentId_isActive_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "children_parentId_isActive_idx" ON public.children USING btree ("parentId", "isActive");


--
-- Name: directories_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX directories_slug_key ON public.directories USING btree (slug);


--
-- Name: growtrack_entries_recordedAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "growtrack_entries_recordedAt_idx" ON public.growtrack_entries USING btree ("recordedAt");


--
-- Name: growtrack_entries_trackedPersonType_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "growtrack_entries_trackedPersonType_idx" ON public.growtrack_entries USING btree ("trackedPersonType");


--
-- Name: growtrack_entries_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "growtrack_entries_userId_idx" ON public.growtrack_entries USING btree ("userId");


--
-- Name: growtrack_entries_userId_recordedAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "growtrack_entries_userId_recordedAt_idx" ON public.growtrack_entries USING btree ("userId", "recordedAt");


--
-- Name: growtrack_entries_userId_trackedPersonType_trackedPersonNam_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "growtrack_entries_userId_trackedPersonType_trackedPersonNam_idx" ON public.growtrack_entries USING btree ("userId", "trackedPersonType", "trackedPersonName");


--
-- Name: kids_corner_lastActiveDate_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "kids_corner_lastActiveDate_idx" ON public.kids_corner USING btree ("lastActiveDate");


--
-- Name: kids_corner_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "kids_corner_userId_idx" ON public.kids_corner USING btree ("userId");


--
-- Name: kids_corner_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "kids_corner_userId_key" ON public.kids_corner USING btree ("userId");


--
-- Name: parentcircle_analytics_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX parentcircle_analytics_date_idx ON public.parentcircle_analytics USING btree (date);


--
-- Name: parentcircle_analytics_date_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX parentcircle_analytics_date_key ON public.parentcircle_analytics USING btree (date);


--
-- Name: parentcircle_answers_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_answers_createdAt_idx" ON public.parentcircle_answers USING btree ("createdAt");


--
-- Name: parentcircle_answers_createdBy_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_answers_createdBy_idx" ON public.parentcircle_answers USING btree ("createdBy");


--
-- Name: parentcircle_answers_isVerified_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_answers_isVerified_idx" ON public.parentcircle_answers USING btree ("isVerified");


--
-- Name: parentcircle_answers_questionId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_answers_questionId_idx" ON public.parentcircle_answers USING btree ("questionId");


--
-- Name: parentcircle_categories_isActive_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_categories_isActive_idx" ON public.parentcircle_categories USING btree ("isActive");


--
-- Name: parentcircle_categories_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX parentcircle_categories_name_key ON public.parentcircle_categories USING btree (name);


--
-- Name: parentcircle_categories_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX parentcircle_categories_slug_key ON public.parentcircle_categories USING btree (slug);


--
-- Name: parentcircle_categories_type_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX parentcircle_categories_type_idx ON public.parentcircle_categories USING btree (type);


--
-- Name: parentcircle_moderation_logs_action_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX parentcircle_moderation_logs_action_idx ON public.parentcircle_moderation_logs USING btree (action);


--
-- Name: parentcircle_moderation_logs_contentType_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_moderation_logs_contentType_idx" ON public.parentcircle_moderation_logs USING btree ("contentType");


--
-- Name: parentcircle_moderation_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_moderation_logs_createdAt_idx" ON public.parentcircle_moderation_logs USING btree ("createdAt");


--
-- Name: parentcircle_moderation_logs_moderatorId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_moderation_logs_moderatorId_idx" ON public.parentcircle_moderation_logs USING btree ("moderatorId");


--
-- Name: parentcircle_question_votes_questionId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_question_votes_questionId_idx" ON public.parentcircle_question_votes USING btree ("questionId");


--
-- Name: parentcircle_question_votes_questionId_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "parentcircle_question_votes_questionId_userId_key" ON public.parentcircle_question_votes USING btree ("questionId", "userId");


--
-- Name: parentcircle_question_votes_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_question_votes_userId_idx" ON public.parentcircle_question_votes USING btree ("userId");


--
-- Name: parentcircle_questions_categoryId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_questions_categoryId_idx" ON public.parentcircle_questions USING btree ("categoryId");


--
-- Name: parentcircle_questions_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_questions_createdAt_idx" ON public.parentcircle_questions USING btree ("createdAt");


--
-- Name: parentcircle_questions_createdBy_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_questions_createdBy_idx" ON public.parentcircle_questions USING btree ("createdBy");


--
-- Name: parentcircle_questions_isPinned_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_questions_isPinned_idx" ON public.parentcircle_questions USING btree ("isPinned");


--
-- Name: parentcircle_questions_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX parentcircle_questions_slug_key ON public.parentcircle_questions USING btree (slug);


--
-- Name: parentcircle_questions_status_categoryId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_questions_status_categoryId_idx" ON public.parentcircle_questions USING btree (status, "categoryId");


--
-- Name: parentcircle_questions_status_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_questions_status_createdAt_idx" ON public.parentcircle_questions USING btree (status, "createdAt");


--
-- Name: parentcircle_questions_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX parentcircle_questions_status_idx ON public.parentcircle_questions USING btree (status);


--
-- Name: parentcircle_reports_contentType_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_reports_contentType_idx" ON public.parentcircle_reports USING btree ("contentType");


--
-- Name: parentcircle_reports_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_reports_createdAt_idx" ON public.parentcircle_reports USING btree ("createdAt");


--
-- Name: parentcircle_reports_reportedBy_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_reports_reportedBy_idx" ON public.parentcircle_reports USING btree ("reportedBy");


--
-- Name: parentcircle_reports_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX parentcircle_reports_status_idx ON public.parentcircle_reports USING btree (status);


--
-- Name: parentcircle_stories_categoryId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_stories_categoryId_idx" ON public.parentcircle_stories USING btree ("categoryId");


--
-- Name: parentcircle_stories_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_stories_createdAt_idx" ON public.parentcircle_stories USING btree ("createdAt");


--
-- Name: parentcircle_stories_createdBy_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_stories_createdBy_idx" ON public.parentcircle_stories USING btree ("createdBy");


--
-- Name: parentcircle_stories_isFeatured_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_stories_isFeatured_idx" ON public.parentcircle_stories USING btree ("isFeatured");


--
-- Name: parentcircle_stories_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX parentcircle_stories_slug_key ON public.parentcircle_stories USING btree (slug);


--
-- Name: parentcircle_stories_status_categoryId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_stories_status_categoryId_idx" ON public.parentcircle_stories USING btree (status, "categoryId");


--
-- Name: parentcircle_stories_status_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_stories_status_createdAt_idx" ON public.parentcircle_stories USING btree (status, "createdAt");


--
-- Name: parentcircle_stories_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX parentcircle_stories_status_idx ON public.parentcircle_stories USING btree (status);


--
-- Name: parentcircle_story_votes_storyId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_story_votes_storyId_idx" ON public.parentcircle_story_votes USING btree ("storyId");


--
-- Name: parentcircle_story_votes_storyId_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "parentcircle_story_votes_storyId_userId_key" ON public.parentcircle_story_votes USING btree ("storyId", "userId");


--
-- Name: parentcircle_story_votes_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "parentcircle_story_votes_userId_idx" ON public.parentcircle_story_votes USING btree ("userId");


--
-- Name: refresh_tokens_expiresAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "refresh_tokens_expiresAt_idx" ON public.refresh_tokens USING btree ("expiresAt");


--
-- Name: refresh_tokens_token_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX refresh_tokens_token_idx ON public.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_token_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "refresh_tokens_userId_idx" ON public.refresh_tokens USING btree ("userId");


--
-- Name: story_comments_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "story_comments_createdAt_idx" ON public.story_comments USING btree ("createdAt");


--
-- Name: story_comments_createdBy_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "story_comments_createdBy_idx" ON public.story_comments USING btree ("createdBy");


--
-- Name: story_comments_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX story_comments_status_idx ON public.story_comments USING btree (status);


--
-- Name: story_comments_status_storyId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "story_comments_status_storyId_idx" ON public.story_comments USING btree (status, "storyId");


--
-- Name: story_comments_storyId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "story_comments_storyId_idx" ON public.story_comments USING btree ("storyId");


--
-- Name: talkeasy_analytics_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX talkeasy_analytics_date_idx ON public.talkeasy_analytics USING btree (date);


--
-- Name: talkeasy_analytics_date_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX talkeasy_analytics_date_key ON public.talkeasy_analytics USING btree (date);


--
-- Name: talkeasy_feedback_messageId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "talkeasy_feedback_messageId_idx" ON public.talkeasy_feedback USING btree ("messageId");


--
-- Name: talkeasy_feedback_rating_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX talkeasy_feedback_rating_idx ON public.talkeasy_feedback USING btree (rating);


--
-- Name: talkeasy_feedback_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "talkeasy_feedback_userId_idx" ON public.talkeasy_feedback USING btree ("userId");


--
-- Name: talkeasy_messages_emotionalIntensity_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "talkeasy_messages_emotionalIntensity_idx" ON public.talkeasy_messages USING btree ("emotionalIntensity");


--
-- Name: talkeasy_messages_primaryCategory_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "talkeasy_messages_primaryCategory_idx" ON public.talkeasy_messages USING btree ("primaryCategory");


--
-- Name: talkeasy_messages_sentiment_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX talkeasy_messages_sentiment_idx ON public.talkeasy_messages USING btree (sentiment);


--
-- Name: talkeasy_messages_sessionId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "talkeasy_messages_sessionId_idx" ON public.talkeasy_messages USING btree ("sessionId");


--
-- Name: talkeasy_messages_timestamp_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX talkeasy_messages_timestamp_idx ON public.talkeasy_messages USING btree ("timestamp");


--
-- Name: talkeasy_messages_timestamp_primaryCategory_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "talkeasy_messages_timestamp_primaryCategory_idx" ON public.talkeasy_messages USING btree ("timestamp", "primaryCategory");


--
-- Name: talkeasy_messages_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "talkeasy_messages_userId_idx" ON public.talkeasy_messages USING btree ("userId");


--
-- Name: talkeasy_messages_userId_sessionId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "talkeasy_messages_userId_sessionId_idx" ON public.talkeasy_messages USING btree ("userId", "sessionId");


--
-- Name: talkeasy_training_data_includeInTraining_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "talkeasy_training_data_includeInTraining_idx" ON public.talkeasy_training_data USING btree ("includeInTraining");


--
-- Name: talkeasy_training_data_primaryCategory_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "talkeasy_training_data_primaryCategory_idx" ON public.talkeasy_training_data USING btree ("primaryCategory");


--
-- Name: talkeasy_training_data_qualityScore_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "talkeasy_training_data_qualityScore_idx" ON public.talkeasy_training_data USING btree ("qualityScore");


--
-- Name: talkeasy_training_data_sentiment_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX talkeasy_training_data_sentiment_idx ON public.talkeasy_training_data USING btree (sentiment);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: articles articles_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: articles articles_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "articles_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: child_activity_logs child_activity_logs_childId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.child_activity_logs
    ADD CONSTRAINT "child_activity_logs_childId_fkey" FOREIGN KEY ("childId") REFERENCES public.children(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: child_buddy_chats child_buddy_chats_childId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.child_buddy_chats
    ADD CONSTRAINT "child_buddy_chats_childId_fkey" FOREIGN KEY ("childId") REFERENCES public.children(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: child_mood_logs child_mood_logs_childId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.child_mood_logs
    ADD CONSTRAINT "child_mood_logs_childId_fkey" FOREIGN KEY ("childId") REFERENCES public.children(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: child_progress child_progress_childId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.child_progress
    ADD CONSTRAINT "child_progress_childId_fkey" FOREIGN KEY ("childId") REFERENCES public.children(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: child_worries child_worries_childId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.child_worries
    ADD CONSTRAINT "child_worries_childId_fkey" FOREIGN KEY ("childId") REFERENCES public.children(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: children children_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.children
    ADD CONSTRAINT "children_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: directories directories_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.directories
    ADD CONSTRAINT "directories_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: growtrack_entries growtrack_entries_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.growtrack_entries
    ADD CONSTRAINT "growtrack_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: kids_corner kids_corner_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kids_corner
    ADD CONSTRAINT "kids_corner_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: parentcircle_answers parentcircle_answers_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_answers
    ADD CONSTRAINT "parentcircle_answers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: parentcircle_answers parentcircle_answers_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_answers
    ADD CONSTRAINT "parentcircle_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public.parentcircle_questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: parentcircle_moderation_logs parentcircle_moderation_logs_moderatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_moderation_logs
    ADD CONSTRAINT "parentcircle_moderation_logs_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: parentcircle_moderation_logs parentcircle_moderation_logs_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_moderation_logs
    ADD CONSTRAINT "parentcircle_moderation_logs_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public.parentcircle_questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: parentcircle_moderation_logs parentcircle_moderation_logs_storyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_moderation_logs
    ADD CONSTRAINT "parentcircle_moderation_logs_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES public.parentcircle_stories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: parentcircle_question_votes parentcircle_question_votes_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_question_votes
    ADD CONSTRAINT "parentcircle_question_votes_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public.parentcircle_questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: parentcircle_question_votes parentcircle_question_votes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_question_votes
    ADD CONSTRAINT "parentcircle_question_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: parentcircle_questions parentcircle_questions_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_questions
    ADD CONSTRAINT "parentcircle_questions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.parentcircle_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: parentcircle_questions parentcircle_questions_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_questions
    ADD CONSTRAINT "parentcircle_questions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: parentcircle_reports parentcircle_reports_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_reports
    ADD CONSTRAINT "parentcircle_reports_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public.parentcircle_questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: parentcircle_reports parentcircle_reports_reportedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_reports
    ADD CONSTRAINT "parentcircle_reports_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: parentcircle_reports parentcircle_reports_reportedUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_reports
    ADD CONSTRAINT "parentcircle_reports_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: parentcircle_reports parentcircle_reports_storyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_reports
    ADD CONSTRAINT "parentcircle_reports_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES public.parentcircle_stories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: parentcircle_stories parentcircle_stories_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_stories
    ADD CONSTRAINT "parentcircle_stories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.parentcircle_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: parentcircle_stories parentcircle_stories_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_stories
    ADD CONSTRAINT "parentcircle_stories_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: parentcircle_story_votes parentcircle_story_votes_storyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_story_votes
    ADD CONSTRAINT "parentcircle_story_votes_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES public.parentcircle_stories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: parentcircle_story_votes parentcircle_story_votes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parentcircle_story_votes
    ADD CONSTRAINT "parentcircle_story_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: story_comments story_comments_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.story_comments
    ADD CONSTRAINT "story_comments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: story_comments story_comments_storyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.story_comments
    ADD CONSTRAINT "story_comments_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES public.parentcircle_stories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: talkeasy_feedback talkeasy_feedback_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.talkeasy_feedback
    ADD CONSTRAINT "talkeasy_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: talkeasy_messages talkeasy_messages_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.talkeasy_messages
    ADD CONSTRAINT "talkeasy_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict 6Lsf4TExf1e3TuIJbYxYB0gFz1SNXVPe18x3tiJtIjFaiQBPLNGOdApeYrxQvV5

