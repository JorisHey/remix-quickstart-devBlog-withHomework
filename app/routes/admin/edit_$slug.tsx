import { useTransition, useActionData, redirect, Form, LoaderFunction, useLoaderData } from "remix";
import type { ActionFunction } from "remix";
import { createPost, getPost } from "~/post";
import invariant from "tiny-invariant";
import { useState } from "react";

type PostError = {
  title?: boolean;
  slug?: boolean;
  markdown?: boolean;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors: PostError = {};
  if (!title) errors.title = true;
  if (!slug) errors.slug = true;
  if (!markdown) errors.markdown = true;

  if (Object.keys(errors).length) {
    return errors;
  }

  invariant(typeof title === "string");
  invariant(typeof slug === "string");
  invariant(typeof markdown === "string");

  await createPost({ title, slug, markdown });

  return redirect("/admin");
};

export const loader:LoaderFunction = async ({ params }) => {
  invariant(params.slug, "expected params.slug");
  const post = await getPost(params.slug);
  return post
};

export default function EditPost() {
  const errors = useActionData();
  const transition = useTransition();
  const post = useLoaderData();
  const [markdown,setMarkdown] = useState(post.body)

  return (
    <Form method="post" key={post.slug}>
      <p>
        <label>
          Post Title: {errors?.title ? <em>Title is required</em> : null}{" "}
          <input type="text" name="title" defaultValue={post.title} readOnly />
        </label>
      </p>
      <p>
        <label>
          Post Slug: {errors?.slug ? <em>Slug is required</em> : null}{" "}
          <input type="text" name="slug" value={post.slug} readOnly />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>{" "}
        {errors?.markdown ? <em>Markdown is required</em> : null}
        <br />
        <textarea id="markdown" rows={20} name="markdown" defaultValue={post.body} />
      </p>
      <p>
        <button type="submit">
          {transition.submission ? "Editing..." : "Edit Post"}
        </button>
      </p>
    </Form>
  );
}
